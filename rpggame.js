/**
 * Created by Anton on 18.02.2017.
 */
var io;
var gameSocket;
var app;

/**
 * This function is called by index.js to initialize a new game instance.
 *
 * @param sio The Socket.IO library
 * @param socket The socket object for the connected client.
 */
exports.initGame = function(sio, socket){
    io = sio;
    gameSocket = socket;
    app = {
        gameId: 0,
        players: [],
    };

    gameSocket.emit('connected', { message: "You are connected!" });

    // Base Events
    gameSocket.on('playerCreateNewGame', playerCreateNewGame);
    gameSocket.on('roomFull', prepareGame);
    gameSocket.on('hostCountdownFinished', startGame);


    // Player Events
    gameSocket.on('playerJoinGame', playerJoinGame);

}

/* *******************************
 *                             *
 *       BASE FUNCTIONS        *
 *                             *
 ******************************* */

/**
 * The 'Create' button was clicked and 'playerCreateNewGame' event occurred.
 */
function playerCreateNewGame(data) {
    // Create a unique Socket.IO Room
    var thisGameId = ( Math.random() * 100000 ) | 0;

    // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
    data.gameId = thisGameId;
    data.mySocketId = this.id;
    app.players.push(data);
    app.gameId = thisGameId;
    app.mySocketId = this.id;
    this.emit('newGameCreated', app);
    //console.log(thisGameId+" # "+this.id);

    // Join the Room and wait for the players
    this.join(thisGameId.toString());
    //console.log(gameSocket.adapter.rooms);
};

/*
 * Two players have joined. Alert the host!
 * @param gameId The game ID / room ID
 */
function prepareGame(gameId) {
    var sock = this;
    var data = {
        mySocketId : sock.id,
        gameId : gameId
    };
    //console.log("All Players Present. Preparing game...");
    io.sockets.in(data.gameId).emit('beginNewGame', data);
}

/*
 * The Countdown has finished, and the game begins!
 * @param gameId The game ID / room ID
 */
function startGame(gameId) {
    console.log('Game Started.');
    sendGameData(gameId);
};


/* *****************************
 *                           *
 *     PLAYER FUNCTIONS      *
 *                           *
 ***************************** */

/**
 * A player clicked the 'START GAME' button.
 * Attempt to connect them to the room that matches
 * the gameId entered by the player.
 * @param data Contains data entered via player's input - playerName and gameId.
 */
function playerJoinGame(data) {
    //console.log('Player ' + data.playerName + 'attempting to join game: ' + data.gameId );

    // A reference to the player's Socket.IO socket object
    var sock = this;

    // Look up the room ID in the Socket.IO manager object.
    var room = gameSocket.adapter.rooms[data.gameId];

    // If the room exists...
    if( room != undefined ){
        // attach the socket id to the data object.
        data.mySocketId = sock.id;

        // Join the room
        sock.join(data.gameId);
        app.players.push(data);
        app.mySocketId = sock.id;


        //console.log(gameSocket.adapter.rooms);
        //console.log('Player ' + data.playerName + ' joining game: ' + data.gameId );

        // Emit an event notifying the clients that the player has joined the room.
        io.sockets.in(data.gameId).emit('playerJoinedRoom', app);

    } else {
        // Otherwise, send an error message back to the player.
        this.emit('error',{message: "This room does not exist."} );
    }
}


/* *************************
 *                       *
 *      GAME LOGIC       *
 *                       *
 ************************* */

/**
 * Get a word for the host, and a list of words for the player.
 *
 * @param wordPoolIndex
 * @param gameId The room identifier
 */
function sendGameData(gameId) {
    io.sockets.in(gameId).emit('newGameData', app);
}