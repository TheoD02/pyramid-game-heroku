import {useEffect} from 'react';
import socket from './Socket';
import uniqid from 'uniqid';
import {useCookies} from 'react-cookie';
import Appbar from './Appbar';
import {Button, Container, Fab, Grid, Typography} from '@material-ui/core';
import {Link} from 'react-router-dom';
import {useQuery} from 'react-query';

export default function App(props)
{
    const [cookies, setCookie] = useCookies(['userID']);
    useEffect(() =>
    {
        if (cookies.userID === undefined) {
            let date = new Date();
            date.setDate(date.getDate() + 1);
            setCookie('userID', uniqid.time('player-', '-id'), {
                expires: date,
            });
            window.location.reload();
        }
    });

    const {isLoading, error, data} = useQuery('repoData', () =>
        fetch(`https://pyramidsgame.herokuapp.com/api/room/get/all`).then(res =>
            res.json(),
        ));

    return (
        <Container>
            <Grid container direction={'row'} justify={'center'} spacing={4}>
                <Grid item>
                    <Link to="/game/create">
                        <Button variant="contained" color="primary" size={'large'}>
                            Créer une partie
                        </Button>
                    </Link>
                </Grid>
                <Grid item>
                    <Link to="/game/join">
                        <Button variant="contained" color="secondary" size={'large'}>
                            Rejoindre une partie
                        </Button>
                    </Link>
                </Grid>
            </Grid>
            <Grid container direction={'row'} justify={'center'} spacing={4}>
                {isLoading && 'Loading'}
                {error && 'An error' + error}
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography>Partie en attente de lancement</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            {data !== undefined && data.filter(r => !r.isStarted).map((room, index) =>
                                <Grid key={index} item>
                                    <Link to={`/game/join/${room.code}`}>
                                        <Fab
                                            variant="extended"
                                            size="small"
                                            color="primary"
                                            aria-label="add"
                                        >
                                            {room.name} - ({room.players.length} joueurs)
                                        </Fab>
                                    </Link>
                                </Grid>,
                            )}
                        </Grid>
                    </Grid>
                </Grid>
                <Grid container spacing={2} style={{marginTop: '2rem'}}>
                    <Grid item xs={12}>
                        <Typography>Partie en cours</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            {data !== undefined && data.filter(r => r.isStarted).map((room, index) =>
                                <Grid key={index} item>
                                    <Link to={`/game/join/${room.code}`}>
                                        <Fab
                                            variant="extended"
                                            size="small"
                                            color="primary"
                                            aria-label="add"
                                        >
                                            {room.name} - ({room.players.length} joueurs)
                                        </Fab>
                                    </Link>
                                </Grid>,
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
}