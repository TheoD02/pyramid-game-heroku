import {Button, FormControlLabel, Grid, Switch, TextField, Typography} from '@material-ui/core';
import {Link, useHistory} from 'react-router-dom';
import socket from './Socket';
import {useCookies} from 'react-cookie';
import {useState} from 'react';

export default function CreateGame()
{
    let history = useHistory();
    const [cookies, setCookie] = useCookies(['userID']);
    const [username, setUsername] = useState(cookies.username);
    const [roomName, setRoomName] = useState(cookies.username ? `Salon de ${cookies.username}` : '');
    const handleUsernameInput = (e) =>
    {
        setUsername(e.currentTarget.value);
    };
    const handleRoomName = (e) =>
    {
        setRoomName(e.currentTarget.value);
    };
    const handleJoinBtn = (e) =>
    {
        saveUsernameInCookie();
        socket.emit('playerCreateGame', {roomName, username}, cookies.userID, {playerCanSeeCardInGame});
        socket.on('successfullyCreateGame', (roomInfo) =>
        {
            history.push(`/game/room/${roomInfo.code}`);
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
    const [playerCanSeeCardInGame, setPlayerCanSeeCardInGame] = useState(true);
    const handlePlayerCanSeeCardInGame = () =>
    {
        setPlayerCanSeeCardInGame(!playerCanSeeCardInGame);
    };
    return (
        <Grid container direction={'row'} alignItems={'center'} alignContent={'center'} justify={'center'} spacing={2}>
            <Grid item xs={12}>
                <Link to={'/'}>Retourner à l'accueil</Link>
            </Grid>
            <Grid item xs={12}>
                <Typography variant={'h6'}>Créer une partie</Typography>
            </Grid>
            <Grid item xs={12}>
                <TextField value={username} onChange={handleUsernameInput} label="Votre nom de joueur" fullWidth/>
            </Grid>
            <Grid item xs={12}>
                <TextField value={roomName} onChange={handleRoomName} label="Nom du salon de jeu" fullWidth/>
            </Grid>
            <Grid item xs={12}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={playerCanSeeCardInGame}
                            onChange={handlePlayerCanSeeCardInGame}
                            name="playerCanSeeCardInGame"
                            color="primary"
                        />
                    }
                    label="Les joueurs peuvent voir leurs cartes durant la partie ?"
                />
            </Grid>
            <Grid item xs={12}>
                <Button variant={'contained'} color={'primary'} onClick={handleJoinBtn}>Créer la partie</Button>
            </Grid>
        </Grid>
    );
}