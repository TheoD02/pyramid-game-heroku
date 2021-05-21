import {useQuery} from 'react-query';
import Swal from 'sweetalert2';
import {useEffect, useState} from 'react';
import {useHistory, useRouteMatch} from 'react-router-dom';
import socket from './Socket';
import {Grid, Typography} from '@material-ui/core';
import CardModel from './Card/CardModel';
import axios from 'axios';
import {useCookies} from 'react-cookie';

export default function PlayGameRoom()
{
    let match = useRouteMatch('/game/room/:roomCode/play');
    let history = useHistory();
    const [cookies, setCookie] = useCookies(['userID']);
    const [gameRoom, setGameRoom] = useState({});
    const [isBackFace, setIsBackFace] = useState(true);

    useEffect(() =>
    {
        getRoomData();
    }, []);
    useEffect(() =>
    {
        socket.emit('verifyUserIsOnLeavePlayerOrInGameRoom', match.params.roomCode, cookies.userID);
        socket.on('onUserCannotJoinCauseOfNotInRoom', () =>
        {
            Swal.fire({
                title: `Salut, tu doit rejoindre la partie par le formulaire !`,
                icon : 'warning',
            });
            history.push('/game/join/' + match.params.roomCode);
        });
        socket.on('roomExistButAlreadyStarted', () =>
        {
            Swal.fire({
                title: `Désolé, la partie que tu recherche existe mais elle est déjà en cours ! Créer en une !`,
                icon : 'warning',
            });
            history.push('/');
        });
        socket.emit('userAttemptToJoinRoom', match.params.roomCode, cookies.userID);
        socket.on('roomExistButAlreadyStarted', () =>
        {
            Swal.fire({
                title: `Désolé, la partie que tu recherche existe mais elle est déjà en cours ! Créer en une !`,
                icon : 'warning',
            });
        });
        socket.on('userFoundInLeavePlayer', (playerInfo) =>
        {
            Swal.fire({
                title            : `Hey ${playerInfo.username} ! Tu nous as quitté trop vite ! Veux tu continuer à jouer ?`,
                showDenyButton   : true,
                showCancelButton : true,
                confirmButtonText: `Rejoindre`,
                denyButtonText   : `Rage quitte`,
            }).then((result) =>
            {
                if (result.isConfirmed) {
                    socket.emit('userConfirmedJoiningAgain', match.params.roomCode, cookies.userID);
                    socket.on('onJoiningAgainSuccess', () =>
                    {
                        getRoomData();
                        Swal.fire('Tu as de nouveau rejoint la partie !', '', 'success');
                    });
                    socket.on('onJoiningAgainFail', () =>
                    {
                        Swal.fire('Désolé un problème est survenue, on a pas retrouvé t\'es données de partie :( !', '', 'error');
                    });
                }
                else if (result.isDenied) {
                    Swal.fire({
                        title            : `Tempis casse toi !`,
                        text             : 'Mais tu est sûr ?',
                        showDenyButton   : true,
                        showCancelButton : true,
                        confirmButtonText: `Non enfaite.`,
                        denyButtonText   : `Ouai mec !`,
                    }, '', 'warning').then(secondRes =>
                    {
                        if (secondRes.isConfirmed) {
                            socket.emit('userConfirmedJoiningAgain', match.params.roomCode, cookies.userID);
                            socket.on('onJoiningAgainSuccess', () =>
                            {
                                getRoomData();
                                Swal.fire('Tu as de nouveau rejoint la partie chakal va !', '', 'success');
                            });
                            socket.on('onJoiningAgainFail', () =>
                            {
                                Swal.fire('Ah bas désolé un problème est survenue, on a pas retrouvé t\'es données de partie :( ! Rage quitte forcé !', '', 'error');
                            });
                        }
                        else if (secondRes.isDenied) {
                            socket.emit('deleteLeavePlayerIfExist', match.params.roomCode, cookies.userID);
                            history.push('/');
                        }
                    });
                }
            });
        });
        socket.on('userJoinedRoomAfterLeave', (username) =>
        {
            Swal.fire({
                toast: true,
                text : `${username} vient de revenir !`,
            });
            getRoomData();
        });
        socket.on('userJoinedRoom', (username) =>
        {
            Swal.fire({
                toast: true,
                text : `${username} vient de rejoindre !`,
            });
            getRoomData();
        });
        socket.on('userDisconnect', (username) =>
        {
            Swal.fire({
                toast: true,
                text : `${username} vient de quitter :'(`,
            });
            getRoomData();
        });
    });

    const getRoomData = () =>
    {
        axios.get(`https://pyramidsgame.herokuapp.com/api/room/get/${match.params.roomCode}`).then((roomInfo) =>
        {
            roomInfo = roomInfo.data;
            if (typeof (roomInfo.error) === 'string') {
                Swal.fire(roomInfo.error);
                history.push('/');
            }
            setGameRoom(roomInfo);
        }).catch((err) =>
        {
            Swal.fire('Une erreur est survenue lors de l\'obtention des données.' + err);
            history.push('/');
        });
    };

    const currentPlayer = gameRoom.players !== undefined && gameRoom.players.find(p => p.cookieID === cookies.userID);
    const isHost = currentPlayer !== undefined ? currentPlayer.isHost : false;
    const totalCardInGame = gameRoom.cards !== undefined ? [].concat.apply([], gameRoom.cards) : false;
    if (currentPlayer === undefined) return 'En attente d\'une intéraction ou vous ne pouvez pas rejoindre la partie...';
    let cardNumber = 1;
    return (
        <>
            <Typography>{isHost ? 'Vous êtes l\'hote' : ''}</Typography>
            <Typography>{totalCardInGame.length} cartes en jeu !</Typography>
            {gameRoom.cards && gameRoom.cards.map((rank, rankNumber) =>
            {
                return (
                    <div key={rankNumber} style={{margin: '0 1rem', display: 'flex', justifyContent: 'center'}}>
                        {rank.map((card, index) =>
                        {
                            return (
                                <div key={index}>
                                    <CardModel key={card.id} cardid={card.id} cardnumber={cardNumber++} ranknumber={rankNumber} iconType={card.iconType} number={card.number}
                                               letters={card.letters} color={card.color} isBackFace={card.isFlipped} canFlipCard={isHost}/>
                                </div>
                            );
                        })}
                    </div>
                );
            })}
            <Typography>Vos cartes</Typography>
            <div style={{display: 'flex'}}>
                {currentPlayer.cards !== undefined && currentPlayer.cards.map(card =>
                {
                    return (
                        <CardModel key={card.id} iconType={card.iconType} canFlipCard={true} number={card.number} letters={card.letters}
                                   color={card.color} canSeeCard={gameRoom.userCanSeeHerCard}/>
                    );
                })}
            </div>
        </>);
}