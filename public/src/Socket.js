import socketIOClient from 'socket.io-client';

const ENDPOINT = 'pyramidsgame.herokuapp.com'
const socket = socketIOClient(ENDPOINT, {transports: ['websocket']});

export default socket;