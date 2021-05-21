'use strict';

const express = require('express');
const socketIO = require('socket.io');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';
const { addRoom, getRoom, getAllRooms, deleteRoom, addPlayerToRoom, getPlayerWithRoomCodeAndSocketID, removePlayerFromRoomWithSocketID, initiateGame, searchPlayerInLeavePlayer, playerReJoinGameAfterLeave, deletePlayerFromLeavePlayer, checkUserCanJoinOrReJoinRoom, flipCardInRoom } = require('./src/utils/RoomManager');

const server = express()
	.use(cors())
	.use((req, res) => res.sendFile(INDEX, { root: __dirname + '/public/build/' }))
	.listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server);

// Run when client connects
io.on('connection', (socket) => {
	/**
	 * Va vérifié si le joueur peu rejoindre un salon directement via le lien, car il c'est déjà inscrit mais peu avoir eu une déconnexion
	 */
	socket.on('verifyUserIsOnLeavePlayerOrInGameRoom', (roomCode, cookieUserID) => {
		const canJoin = checkUserCanJoinOrReJoinRoom(roomCode, cookieUserID);
		if (!canJoin) {
			const room = getRoom(roomCode);
			if (room !== undefined) {
				if (room.isStarted) {
					socket.emit('roomExistButAlreadyStarted');
					return;
				}
			}
			socket.emit('onUserCannotJoinCauseOfNotInRoom');
		}
	});

	/**
	 * Quand un utilisateur essaye de rejoindre on va le rechercher dans la liste des joueurs ayant quitte
	 */
	socket.on('userAttemptToJoinRoom', (roomCode, cookieUserID) => {
		const room = getRoom(roomCode);
		if (room !== undefined) {
			const player = searchPlayerInLeavePlayer(roomCode, cookieUserID);
			if (player) {
				socket.emit('userFoundInLeavePlayer', player);
			}
		}
	});

	/**
	 * Si l'utilisateur a confirmer qu'il souhaiter rejoindre malgrès la déconnexion on le reinsert dans son salon
	 *
	 */
	socket.on('userConfirmedJoiningAgain', (roomCode, cookieUserID) => {
		const player = playerReJoinGameAfterLeave(roomCode, cookieUserID, socket.id);
		if (player) {
			socket.roomCode = roomCode;
			socket.join(roomCode);
			socket.emit('onJoiningAgainSuccess');
			socket.broadcast.to(roomCode).emit('userJoinedRoomAfterLeave', player.username);
		} else {
			socket.emit('onJoiningAgainFail');
		}
	});

	/**
	 * Si l'utilisateur a confirmer qu'il ne souhaité par revenir en jeu alors on le retire des joueurs ayant quittés
	 */
	socket.on('deleteLeavePlayerIfExist', (roomCode, cookieUserID) => {
		deletePlayerFromLeavePlayer(roomCode, cookieUserID);
	});

	/**
	 * Quand un joueur créer un partie
	 */
	socket.on('playerCreateGame', ({ roomName, username }, cookiePlayerID, gameOptions) => {
		const room = addRoom(roomName, gameOptions);
		addPlayerToRoom(username, room.code, socket.id, cookiePlayerID, true);
		socket.roomCode = room.code;
		socket.join(room.code);
		socket.emit('successfullyCreateGame', room);
		socket.broadcast.to(room.code).emit('newRoomCreated', room);
	});

	/**
	 * Quand un joueur tente de rejoindre une salle
	 */
	socket.on('joiningRoom', ({ username, roomCode }, cookiePlayerID) => {
		const room = getRoom(roomCode);
		if (room !== undefined) {
			if (room.isStarted) {
				socket.emit('gameAlreadyStarted');
			} else {
				const result = addPlayerToRoom(username, roomCode, socket.id, cookiePlayerID);
				if (result !== false) {
					socket.roomCode = roomCode;
					socket.join(roomCode);
					socket.emit('successfullyJoinedRoom');
					socket.broadcast.to(roomCode).emit('userJoinedRoom', username);
				} else {
					socket.emit('errorWhenJoiningRoom');
				}
			}
		}
	});

	/**
	 * Quand l'hote clique sur le bouton de lancement de la partie
	 */
	socket.on('hostLaunchGame', () => {
		const room = initiateGame(socket.roomCode);
		if (room) {
			io.to(socket.roomCode).emit('gameLaunching', room);
		} else {
			socket.emit('failedToLaunchGame');
		}
	});

	socket.on('flipCard', (cardID, cardRank, cardNumber) => {
		const canFlip = flipCardInRoom(socket.roomCode, cardID, cardRank, cardNumber);
		if (canFlip === true) {
			io.to(socket.roomCode).emit('onCardFlip', cardID, cardRank);
		} else {
			socket.emit('onCardCannotFlip', canFlip);
		}
	});

	/**
	 * Quand un utilisateur se déconnecte
	 */
	socket.on('disconnect', () => {
		const player = getPlayerWithRoomCodeAndSocketID(socket.roomCode, socket.id);
		if (player) {
			removePlayerFromRoomWithSocketID(socket.roomCode, socket.id);
			io.to(player.roomCode).emit('userDisconnect', player.username, getRoom(player.roomCode));
		}
	});
});

app.get('/api/room/get/all', (req, res) => {
	res.send(JSON.stringify(getAllRooms()));
});

app.get('/api/room/get/:roomCode', (req, res) => {
	const room = getRoom(req.params.roomCode);
	if (room !== undefined) {
		res.send(JSON.stringify(room));
	} else {
		res.send(JSON.stringify({ error: `Pas de salle correspondante au code : [${req.params.roomCode}]` }));
	}
});
