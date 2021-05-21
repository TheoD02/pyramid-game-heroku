import React, {useEffect, useState} from 'react';
import {Button, Grid, TextField, Typography} from '@material-ui/core';
import {Link, useHistory, useRouteMatch} from 'react-router-dom';
import socket from './Socket';
import {useCookies} from 'react-cookie';
import Swal from 'sweetalert2';
import uniqid from 'uniqid';

export default function JoinGame()
{
    let history = useHistory();
    let match = useRouteMatch('/game/join/:roomCode?');
    const [cookies, setCookie] = useCookies(['userID', 'username']);
    const [roomCode, setRoomCode] = useState(match.params.roomCode);
    const [username, setUsername] = useState(cookies.username);
    const handleJoinBtn = () =>
    {
        saveUsernameInCookie();
        socket.emit('joiningRoom', {username, roomCode}, cookies.userID);
        socket.on('gameAlreadyStarted', () =>
        {
            Swal.fire(`La partie que tu tente de rejoindre est déjà lancer !`);
        });
        socket.on('successfullyJoinedRoom', () =>
        {
            Swal.fire(`Tu as rejoint la partie avec succès !`);
            history.push(`/game/room/${roomCode}`);
        });
        socket.on('errorWhenJoiningRoom', () =>
        {
            Swal.fire(`Pas de salle correspondante au code : [${roomCode}]`);
        });
    };

    const saveUsernameInCookie = () =>
    {
        let date = new Date();
        date.setDate(date.getDate() + 365);
        setCookie('username', username, {
            expires: date,
        });
    };

    const handleRoomCodeInput = (e) =>
    {
        setRoomCode(e.currentTarget.value);
    };
    const handleUsernameInput = (e) =>
    {
        setUsername(e.currentTarget.value);
    };

    return (
        <Grid container direction={'row'} alignItems={'center'} alignContent={'center'} justify={'center'} spacing={2}>
            <Grid item xs={12}>
                <Link to={'/'}>Retourner à l'accueil</Link>
            </Grid>
            <Grid item xs={12}>
                <Typography variant={'h6'}>Rejoindre une partie</Typography>
            </Grid>
            <Grid item xs={12}>
                <TextField value={username} onChange={handleUsernameInput} label="Nom de joueur" fullWidth/>
            </Grid>
            <Grid item xs={12}>
                <TextField value={roomCode} onChange={handleRoomCodeInput} label="Code de la partie" fullWidth/>
            </Grid>
            <Grid item xs={12}>
                <Button variant={'contained'} color={'primary'} onClick={handleJoinBtn}>Rejoindre la partie</Button>
            </Grid>
        </Grid>
    );
}