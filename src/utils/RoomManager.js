const CardGame = require('./CardGame');
let rooms = [];
let playerWhoLeave = [];

/**
 * Ajoute une nouvelle salle
 *
 * @param roomName Nom de la salle
 * @return string Retourne la salle créer
 */
const addRoom = (roomName, options) =>
{
    const roomCode = generateRoomCode();
    rooms.push({
        name             : roomName,
        code             : roomCode,
        players          : [],
        cards            : [],
        isStarted        : false,
        userCanSeeHerCard: options.playerCanSeeCardInGame,
    });
    return rooms[rooms.length - 1];
};

/**
 * Récupérer une salle via son code
 * @param roomCode code de la salle
 * @return array|undefined Retourne la salle ou undefined si elle n'existe pas
 */
const getRoom = (roomCode) =>
{
    return rooms.find(room => room.code === roomCode);
};

/**
 * Retourne toutes les salles
 *
 * @return array Retourne toutes les salles
 */
const getAllRooms = () =>
{
    return rooms;
};

/**
 * Supprime une salle
 *
 * @param roomCode code de la salle a supprimer
 * @returns array Retourne la salle supprimer
 */
const deleteRoom = (roomCode) =>
{
    const roomIndex = rooms.findIndex(room => room.code === roomCode);
    if (roomIndex !== -1) {
        return rooms.splice(roomIndex, 1);
    }
};

/**
 * Ajoute un joueur dans une salle
 * @param username
 * @param roomCode
 * @param socketID
 * @param isHost
 * @return {boolean}
 */
const addPlayerToRoom = (username, roomCode, socketID, cookieID, isHost = false) =>
{
    const roomIndex = rooms.findIndex(room => room.code === roomCode);
    if (roomIndex !== -1) {
        rooms[roomIndex].players.push({
            id   : socketID,
            cookieID,
            username,
            isHost,
            roomCode,
            cards: [],
        });
        return rooms[roomIndex].players[rooms[roomIndex].players.length - 1];
    }
    return false;
};

/**
 * Supprimer un joueur d'une salle via son socketID
 *
 * @param roomCode
 * @param socketID
 */
const removePlayerFromRoomWithSocketID = (roomCode, socketID) =>
{
    const roomIndex = rooms.findIndex(r => r.code === roomCode);
    if (roomIndex !== -1) {
        const playerIndex = rooms[roomIndex].players.findIndex(p => p.id === socketID);
        if (playerIndex !== -1) {
            playerWhoLeave.push(rooms[roomIndex].players[playerIndex]);
            const removedPlayer = rooms[roomIndex].players.splice(playerIndex, 1);
            return removedPlayer;
        }
    }
    return false;
};

/**
 * Retrouve un joueur dans une salle via le code et l'id socket
 * @param roomCode
 * @param socketID
 * @return {boolean|*}
 */
const getPlayerWithRoomCodeAndSocketID = (roomCode, socketID) =>
{
    const room = getRoom(roomCode);
    if (room !== undefined) {
        const player = room.players.find(p => p.id === socketID);
        if (player !== undefined) {
            return player;
        }
    }
    return false;
};

/**
 * Initie la partie (génération du jeu de carte, et tu stack de chaque joueur)
 *
 * @param roomCode
 * @return {boolean|*}
 */
const initiateGame = (roomCode) =>
{
    const roomIndex = rooms.findIndex(r => r.code === roomCode);
    if (roomIndex !== -1) {
        const room = rooms[roomIndex];
        const cardManager = new CardGame();
        cardManager.generateStackOfCards();
        room.isStarted = true;
        room.players.forEach((p, index) =>
        {
            room.players[index]['cards'] = cardManager.getCardForPlayer();
        });
        room.cards = cardManager.generateGame();
        rooms[roomIndex] = room;
        return room;
    }
    return false;
};

/**
 * Recherche un joueur qui est dans la liste des joueurs ayant quitté
 *
 * @param roomCode
 * @param cookieUserID
 * @return {boolean|*}
 */
const searchPlayerInLeavePlayer = (roomCode, cookieUserID) =>
{
    const player = playerWhoLeave.find(p => p.roomCode === roomCode && p.cookieID === cookieUserID);
    if (player !== undefined) {
        return player;
    }
    return false;
};

/**
 * Remet le joueur dans la salle dans laquelle il etait avant d'avoir quitté.
 *
 * @param roomCode
 * @param cookieUserID
 * @param socketID
 * @return {boolean|*}
 */
const playerReJoinGameAfterLeave = (roomCode, cookieUserID, socketID) =>
{
    const playerIndex = playerWhoLeave.findIndex(p => p.roomCode === roomCode && p.cookieID === cookieUserID);
    const roomIndex = rooms.findIndex(r => r.code === roomCode);
    if (playerIndex !== -1 && roomIndex !== -1) {
        const player = playerWhoLeave[playerIndex];
        player.id = socketID;
        player.cookieID = cookieUserID;
        rooms[roomIndex].players.push(player);
        playerWhoLeave.splice(playerIndex, 1);
        return player;
    }
    return false;
};

/**
 * Supprime un joueur de la liste des joueurs ayant quitté
 *
 * @param roomCode
 * @param cookieUserID
 */
const deletePlayerFromLeavePlayer = (roomCode, cookieUserID) =>
{
    const playerIndex = playerWhoLeave.findIndex(p => p.roomCode === roomCode && p.cookieID === cookieUserID);
    if (playerIndex !== -1) {
        playerWhoLeave.splice(playerIndex, 1);
    }
};

/**
 * Vérifie qu'un utiliseur puissent rejoindre un salon car il est déjà dans la partie ou dans la liste des peronnes ayant quitté
 *
 * @param roomCode
 * @param cookieUserID
 * @return {boolean}
 */
const checkUserCanJoinOrReJoinRoom = (roomCode, cookieUserID) =>
{
    const room = getRoom(roomCode);
    if (room !== undefined) {
        const playerInRoom = room.players.find(p => p.roomCode === roomCode && p.cookieID === cookieUserID);
        const playerInLeave = playerWhoLeave.find(p => p.roomCode === roomCode && p.cookieID === cookieUserID);
        if (playerInRoom !== undefined || playerInLeave !== undefined) {
            return true;
        }
    }
    return false;
};

const flipCardInRoom = (roomCode, cardID, cardRank, cardNumber) =>
{
    const room = getRoom(roomCode);
    if (room !== undefined) {
        const allCards = [].concat.apply([], room.cards);
        const allPlayedCards = allCards.filter(c => c.isFlipped === false);
        const playedCardsLength = allPlayedCards !== undefined ? allPlayedCards.length : 0;
        const validCardNumber = allCards.length - playedCardsLength;
        if (validCardNumber === cardNumber) {
            const cardsOfRanks = room.cards[cardRank];
            let cardIndex = cardsOfRanks.findIndex(c => c.id === cardID);
            if (cardIndex !== -1) {
                room.cards[cardRank][cardIndex].isFlipped = false;
            }
            return true;
        }
        else {
            return validCardNumber;
        }
    }
};

/**
 * Génère le code de la partie et vérifie que celui-ci ne soit pas déjà existant
 *
 * @param codeLength longueur du code
 * @returns {string}
 */
const generateRoomCode = (codeLength = 4) =>
{
    const randomCode = Math.round((Math.pow(36, codeLength + 1) - Math.random() * Math.pow(36, codeLength))).toString(36).slice(1).toUpperCase();
    const gameCodeExist = rooms.find(room => room.code === randomCode);
    if (gameCodeExist === undefined) {
        return randomCode;
    }
    generateRoomCode(codeLength);
};

module.exports = {
    addRoom,
    getRoom,
    getAllRooms,
    deleteRoom,
    addPlayerToRoom,
    getPlayerWithRoomCodeAndSocketID,
    removePlayerFromRoomWithSocketID,
    initiateGame,
    searchPlayerInLeavePlayer,
    playerReJoinGameAfterLeave,
    deletePlayerFromLeavePlayer,
    checkUserCanJoinOrReJoinRoom,
    flipCardInRoom,
};