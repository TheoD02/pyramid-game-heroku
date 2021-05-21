import {Button, Grid, Typography} from '@material-ui/core';
import {useEffect, useState} from 'react';
import PlayerCard from './PlayerCard';
import Swal from 'sweetalert2';
import socket from './Socket';
import {useHistory, useRouteMatch} from 'react-router-dom';
import axios from 'axios';
import {useCookies} from 'react-cookie';

export default function GameRoom()
{
    let match = useRouteMatch('/game/room/:roomCode');
    let history = useHistory();
    const [cookies, setCookie] = useCookies(['userID']);
    const [gameRoom, setGameRoom] = useState({});

    useEffect(() =>
    {
        getRoomData();
    }, []);
    socket.emit('verifyUserIsOnLeavePlayerOrInGameRoom', match.params.roomCode, cookies.userID);
    socket.on('onUserCannotJoinCauseOfNotInRoom', () =>
    {
        Swal.fire({
            title: `Salut, tu doit rejoindre la partie par le formulaire !`,
            icon : 'warning',
        });
        history.push('/game/join/' + match.params.roomCode);
    });
    socket.emit('userAttemptToJoinRoom', match.params.roomCode, cookies.userID);
    socket.on('roomExistButAlreadyStarted', () =>
    {
        Swal.fire({
            title: `Désolé, la partie que tu recherche existe mais elle est déjà en cours ! Créer en une !`,
            icon : 'warning',
        });
        history.push('/');
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
    socket.on('gameLaunching', (roomInfo) =>
    {
        Swal.fire({title: 'La partie va commencer !', timer: 2000, timerProgressBar: true, showConfirmButton: false}).then(() =>
        {
            history.push('/game/room/' + match.params.roomCode + '/play');
        });
    });
    socket.on('failedToLaunchGame', (roomInfo) =>
    {
        Swal.fire('Un problème est survenue lors de la génération de la partie, veuillez recréer le salon si le problème persiste !');
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
            if (roomInfo.isStarted) {
                history.push('/game/room/' + roomInfo.code + '/play');
            }
            setGameRoom(roomInfo);
        }).catch((err) =>
        {
            Swal.fire('Une erreur est survenue lors de l\'obtention des données.' + err);
            history.push('/');
        });
    };

    const handleGameStart = () =>
    {
        socket.emit('hostLaunchGame');
    };

    const isHost = gameRoom.players !== undefined && gameRoom.players.find(p => p.isHost === true && p.cookieID === cookies.userID) !== undefined;
    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <Typography variant={'h4'}>Bienvenue dans le salon "{gameRoom.name}"</Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant={'h6'}>Le code de la salle est : #{gameRoom.code}</Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant={'h6'}>Listes des joueurs participants :</Typography>
                <Grid container spacing={2}>
                    {gameRoom.players !== undefined && gameRoom.players.map((p, index) => (
                        <Grid key={index} item>
                            <PlayerCard playerName={p.username} isHost={p.isHost}/>
                        </Grid>
                    ))}
                </Grid>
            </Grid>
            <Grid item>
                {isHost && <Button variant={'contained'} color={'primary'} onClick={handleGameStart}>isHost</Button>}
            </Grid>
        </Grid>
    );
}