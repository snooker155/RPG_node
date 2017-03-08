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
    gameSocket.on('playerCastSpell', playerCastSpell);

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



function playerCastSpell(combo) {
    var self = this;
    var playerCombo = $.map(combo, function(n){
        return n.spell;
    });
    app.players.forEach(function(player){
        if(player.mySocketId == self.id){
            console.log(playerCombo);
            player.combo = playerCombo;
            //io.sockets.sockets[player.mySocketId].emit('opponentCombo', combo);
        }else{
            io.sockets.sockets[player.mySocketId].emit('opponentCombo', combo);
        }
    });

    var comboSpell = findSpell(playerCombo);
    self.emit('comboSpell', comboSpell);

    //console.log(app.players);
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

/**
 * Get a word for the host, and a list of words for the player.
 *
 * @param wordPoolIndex
 * @param gameId The room identifier
 */
function findSpell(combo) {
    combo = combo.join("");
    var comboSpell = spells[combo];
    return comboSpell;
}


/**
 * Each element in the array provides data for a single round in the game.
 *
 * In each round, two random "words" are chosen as the host word and the correct answer.
 * Five random "decoys" are chosen to make up the list displayed to the player.
 * The correct answer is randomly inserted into the list of chosen decoys.
 *
 * @type {Array}
 */
var spells = {
    1: {
        letter: "F",
        icon_class: ,
        spell_name: ,
        type: ,
        manacost: ,
        healthcost: ,
        cooldown: ,
    },
    2: {
        letter: "I",
        icon_class: ,
        spell_name: ,
        type: ,
        manacost: ,
        healthcost: ,
        cooldown: ,
    },
    3: {
        letter: "S",
        icon_class: ,
        spell_name: ,
        type: ,
        manacost: ,
        healthcost: ,
        cooldown: ,
    },
    4: {
        letter: "N",
        icon_class: ,
        spell_name: ,
        type: ,
        manacost: ,
        healthcost: ,
        cooldown: ,
    },
    5: {
        letter: "C",
        icon_class: ,
        spell_name: ,
        type: ,
        manacost: ,
        healthcost: ,
        cooldown: ,
    },
    6: {
        letter: "B",
        icon_class: ,
        spell_name: ,
        type: ,
        manacost: ,
        healthcost: ,
        cooldown: ,
    },
    7: {
        letter: "W",
        icon_class: ,
        spell_name: ,
        type: ,
        manacost: ,
        healthcost: ,
        cooldown: ,
    },
    8: {
        letter: "D",
        icon_class: ,
        spell_name: ,
        type: ,
        manacost: ,
        healthcost: ,
        cooldown: ,
    },

    //// Fire two spells

    11: {},
    12: {},
    13: {},
    14: {},
    15: {},
    16: {},
    17: {},
    18: {},

    //// Ice two spells

    22: {},
    23: {},
    24: {},
    25: {},
    26: {},
    27: {},
    28: {},

    //// Storm two spells

    33: {},
    34: {},
    35: {},
    36: {},
    37: {},
    38: {},

    //// Nature two spells

    44: {},
    45: {},
    46: {},
    47: {},
    48: {},

    //// Cabal two spells

    55: {},
    56: {},
    57: {},
    58: {},

    //// Blood two spells

    66: {},
    67: {},
    68: {},

    //// Weapon two spells

    77: {},
    78: {},

    //// Defend two spells

    88: {},

};