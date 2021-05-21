import React from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
} from 'react-router-dom';
import App from './App';
import {QueryClient, QueryClientProvider} from 'react-query';
import {CookiesProvider} from 'react-cookie';
import Appbar from './Appbar';
import CreateGame from './CreateGame';
import JoinGame from './JoinGame';
import GameRoom from './GameRoom';
import PlayGameRoom from './PlayGameRoom';

const queryClient = new QueryClient();

ReactDOM.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <CookiesProvider>
                <Router>
                    <Appbar title={'Accueil'}/>
                    <Switch>
                        <Route exact path="/game/room/:roomCode/play">
                            <PlayGameRoom/>
                        </Route>
                        <Route exact path="/game/room/:roomCode">
                            <GameRoom/>
                        </Route>
                        <Route exact path="/game/join/:roomCode?">
                            <JoinGame/>
                        </Route>
                        <Route exact path="/game/create">
                            <CreateGame/>
                        </Route>
                        <Route exact path="/">
                            <App/>
                        </Route>
                    </Switch>
                </Router>
            </CookiesProvider>
        </QueryClientProvider>
    </React.StrictMode>,
    document.getElementById('root'),
);