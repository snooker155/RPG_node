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
        players: {},
    };

    gameSocket.emit('connected', { message: "You are connected!" });

    // Base Events
    gameSocket.on('playerCreateNewGame', playerCreateNewGame);
    gameSocket.on('roomFull', prepareGame);
    gameSocket.on('hostCountdownFinished', startGame);


    // Player Events
    gameSocket.on('playerJoinGame', playerJoinGame);
    gameSocket.on('playerCastSpell', playerCastSpell);
    gameSocket.on('playerCastComboSpell', playerCastComboSpell);

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
    app.gameId = thisGameId;
    app.mySocketId = this.id;
    app.players[this.id] = {
      gameId: thisGameId,
      mySocketId: this.id,
      playerName: data.playerName,
      totalHp: 1000,
      hp: 1000,
      totalMana: 100,
      mana: 100,
      summon: [],
      buffs: [],
    };
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
    var data = app
    //console.log("All Players Present. Preparing game...");
    io.sockets.in(data.gameId).emit('beginNewGame', data);
}

/*
 * The Countdown has finished, and the game begins!
 * @param gameId The game ID / room ID
 */
function startGame(gameId) {
    console.log('Game Started.');
    sendNewGameData(gameId);
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
    var playerCombo = combo.map(function(n){
        return n.spell;
    });
    if(playerCombo != ""){
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
      console.log(comboSpell);
      self.emit('comboSpell', comboSpell);
    }

    //console.log(app.players);
}

function playerCastComboSpell(comboSpell) {
    var self = this;
    console.log(comboSpell);
    console.log(app.players);

    switch (comboSpell.type) {
      case 'target':
        makeDamage(comboSpell);
        // comboSpell.manaCost();
        // comboSpell.setCooldown();
        break;
      // case 'heal':
      //   spell.makeHeal(self.target);
      //   spell.manaCost(self);
      //   spell.setCooldown(self);
      //   break;
      // case 'buff':
      //   spell.setBuff(self.target);
      //   spell.manaCost(self);
      //   spell.setCooldown(self);
      //   break;
      // case 'debuff':
      //   spell.setDebuff(self.target);
      //   spell.manaCost(self);
      //   spell.setCooldown(self);
      //   break;
      // case 'summon':
      //   spell.setSummon(self.target);
      //   spell.manaCost(self);
      //   spell.setCooldown(self);
      //   break;
      default:
        console.log('Spell type is undefined');
        break;
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
function sendNewGameData(gameId) {
    io.sockets.in(gameId).emit('newGameData', app);
}

/**
 * Get a word for the host, and a list of words for the player.
 *
 * @param wordPoolIndex
 * @param gameId The room identifier
 */
function sendGameData(gameId) {
    io.sockets.in(gameId).emit('gameData', app);
}

/**
 * Get a word for the host, and a list of words for the player.
 *
 * @param wordPoolIndex
 * @param gameId The room identifier
 */
function updateOppHp(gameId, player) {
  console.log(player);
    io.sockets.in(gameId).emit('updateOppData', player);
}

/**
 * Get a word for the host, and a list of words for the player.
 *
 * @param wordPoolIndex
 * @param gameId The room identifier
 */
function findSpell(combo) {
    combo = combo.sort().join("");
    console.log(combo);
    var comboSpell = spells[combo];
    return comboSpell;
}

/**
 * Get a word for the host, and a list of words for the player.
 *
 * @param wordPoolIndex
 * @param gameId The room identifier
 */
function makeDamage(comboSpell){
  app.players.forEach(function(player){
    if(player.mySocketId == comboSpell.target.mySocketId){
      player.hp -= comboSpell.value;
      updateOppHp(comboSpell.target.gameId, player);
    }
  });
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
        icon_class: 'sprite-Fire',
        spell_name: 'Fireball',
        type: 'target',
        value: 15,
        school: 'fire',
        manacost: 10,
        healthcost: 0,
        cooldown: 10000,
    },
    2: {
        letter: "I",
        icon_class: 'sprite-Ice',
        spell_name: 'Icebolt',
        type: 'target',
        value: 13,
        school: 'ice',
        manacost: 10,
        healthcost: 0,
        cooldown: 5000,
    },
    3: {
        letter: "S",
        icon_class: 'sprite-Storm',
        spell_name: "Stormbolt",
        type: 'aoe',
        value: 5,
        school: 'storm',
        manacost: 10,
        healthcost: 0,
        cooldown: 10000,
    },
    4: {
        letter: "N",
        icon_class: 'sprite-Nature',
        spell_name: 'Wraith of Nature',
        type: 'heal',
        value: 20,
        school: 'nature',
        manacost: 10,
        healthcost: 0,
        cooldown: 5000,
    },
    5: {
        letter: "C",
        icon_class: 'sprite-Cabal',
        spell_name: 'Shadowbolt',
        type: 'debuff',
        value: 10,
        school: 'cabal',
        manacost: 20,
        healthcost: 0,
        cooldown: 15000,
    },
    6: {
        letter: "B",
        icon_class: 'sprite-Blood',
        spell_name: 'Bloodsteal',
        type: 'target',
        value: 15,
        school: 'blood',
        manacost: 0,
        healthcost: 10,
        cooldown: 10000,
    },
    7: {
        letter: "W",
        icon_class: 'sprite-Weapon',
        spell_name: 'Basic attack',
        type: 'target',
        value: 5,
        school: 'basic',
        manacost: 0,
        healthcost: 0,
        cooldown: 3000,
    },
    8: {
        letter: "D",
        icon_class: 'sprite-Defence',
        spell_name: 'Defence',
        type: 'buff',
        value: 0,
        school: 'basic',
        manacost: 0,
        healthcost: 0,
        cooldown: 10000,
    },

    //// Fire two spells

    11: {
        letter: "FF",
        icon_class: 'sprite-Fireball',
        spell_name: 'Fireball',
        type: 'target',
        value: 30,
        school: 'fire',
        manacost: 20,
        healthcost: 0,
        cooldown: 20000,
    },
    12: {
        letter: "FI",
        icon_class: 'sprite-Frostfire',
        spell_name: 'Frost Fire',
        type: 'target',
        value: 28,
        school: ['fire', 'frost'],
        manacost: 20,
        healthcost: 0,
        cooldown: 15000,
    },
    13: {
        letter: "FS",
        icon_class: 'sprite-Firerain',
        spell_name: 'Fire Rain',
        type: 'aoe',
        value: 5,
        school: 'fire',
        manacost: 20,
        healthcost: 0,
        cooldown: 10000,
    },
    14: {
        letter: "FN",
        icon_class: 'sprite-Fire-Elemental',
        spell_name: 'Fire Elemental',
        type: 'summon',
        value: 0,
        school: 'fire',
        manacost: 25,
        healthcost: 0,
        cooldown: 30000,
    },
    15: {
        letter: "FC",
        icon_class: 'sprite-Dark-Flame',
        spell_name: 'Dark Flame',
        type: ['target', 'debuff'],
        value: 10,
        school: ['fire', 'cabal'],
        manacost: 30,
        healthcost: 0,
        cooldown: 25000,
    },
    16: {
        letter: "FB",
        icon_class: 'sprite-Fireblood',
        spell_name: 'Fire Blood',
        type: 'buff',
        value: 0,
        school: 'fire',
        manacost: 10,
        healthcost: 10,
        cooldown: 20000,
    },
    17: {
        letter: "FW",
        icon_class: 'sprite-Fire-Sword',
        spell_name: 'Fire Sword',
        type: 'target',
        value: 15,
        school: 'fire',
        manacost: 15,
        healthcost: 0,
        cooldown: 15000,
    },
    18: {
        letter: "FD",
        icon_class: 'sprite-Fire-shield',
        spell_name: 'Fire Shield',
        type: 'buff',
        value: 0,
        school: 'fire',
        manacost: 35,
        healthcost: 0,
        cooldown: 30000,
    },

    //// Ice two spells

    22: {
        letter: "II",
        icon_class: 'sprite-Icebolt',
        spell_name: 'Icebolt',
        type: 'fire',
        manacost: 20,
        healthcost: 0,
        cooldown: 10000,
    },
    23: {
        letter: "IS",
        icon_class: 'sprite-Ice-blust',
        spell_name: 'Ice Blust',
        type: 'fire',
        manacost: 25,
        healthcost: 0,
        cooldown: 15000,
    },
    24: {
        letter: "IN",
        icon_class: 'sprite-Ice-Prison',
        spell_name: 'Ice Prison',
        type: 'fire',
        manacost: 40,
        healthcost: 0,
        cooldown: 30000,
    },
    25: {
        letter: "IC",
        icon_class: 'sprite-Winter',
        spell_name: 'Winter',
        type: 'fire',
        manacost: 100,
        healthcost: 0,
        cooldown: 60000,
    },
    26: {
        letter: "IB",
        icon_class: 'sprite-Frost-Blood',
        spell_name: 'Frost Blood',
        type: 'fire',
        manacost: 30,
        healthcost: 30,
        cooldown: 60000,
    },
    27: {
        letter: "IW",
        icon_class: 'sprite-Ice-Sword',
        spell_name: 'Ice Sword',
        type: 'fire',
        manacost: 15,
        healthcost: 0,
        cooldown: 15000,
    },
    28: {
        letter: "ID",
        icon_class: 'sprite-Ice-shield',
        spell_name: 'Ice Block',
        type: 'fire',
        manacost: 35,
        healthcost: 0,
        cooldown: 30000,
    },

    //// Storm two spells

    33: {
        letter: "SS",
        icon_class: 'sprite-Stormbolt',
        spell_name: 'Stormbolt',
        type: 'fire',
        manacost: 20,
        healthcost: 0,
        cooldown: 30000,
    },
    34: {
        letter: "SN",
        icon_class: 'sprite-Electric-void',
        spell_name: 'Electric Void',
        type: 'fire',
        manacost: 30,
        healthcost: 0,
        cooldown: 30000,
    },
    35: {
        letter: "SC",
        icon_class: 'sprite-Eclipse',
        spell_name: 'Eclipse',
        type: 'fire',
        manacost: 100,
        healthcost: 0,
        cooldown: 100000,
    },
    36: {
        letter: "SB",
        icon_class: 'sprite-Power-of-Gods',
        spell_name: 'Power of Gods',
        type: 'fire',
        manacost: 30,
        healthcost: 30,
        cooldown: 60000,
    },
    37: {
        letter: "SW",
        icon_class: 'sprite-Lightning-Sword',
        spell_name: 'Lightning Sword',
        type: 'fire',
        manacost: 15,
        healthcost: 0,
        cooldown: 15000,
    },
    38: {
        letter: "SD",
        icon_class: 'sprite-Storm-Shield',
        spell_name: 'Storm Shield',
        type: 'fire',
        manacost: 60,
        healthcost: 0,
        cooldown: 60000,
    },

    //// Nature two spells

    44: {
        letter: "NN",
        icon_class: 'sprite-Great-Nature',
        spell_name: 'Great Nature',
        type: 'fire',
        manacost: 20,
        healthcost: 0,
        cooldown: 20000,
    },
    45: {
        letter: "NC",
        icon_class: 'sprite-Release-Undeads',
        spell_name: 'Release Undeads',
        type: 'fire',
        manacost: 30,
        healthcost: 0,
        cooldown: 30000,
    },
    46: {
        letter: "NB",
        icon_class: 'sprite-Summon-Beasts',
        spell_name: 'Summon Beasts',
        type: 'fire',
        manacost: 30,
        healthcost: 30,
        cooldown: 60000,
    },
    47: {
        letter: "NW",
        icon_class: 'sprite-Force-of-Nature',
        spell_name: 'Force of Nature',
        type: 'fire',
        manacost: 20,
        healthcost: 0,
        cooldown: 20000,
    },
    48: {
        letter: "ND",
        icon_class: 'sprite-Nature-Protection',
        spell_name: 'Nature Protection',
        type: 'fire',
        manacost: 35,
        healthcost: 0,
        cooldown: 30000,
    },

    //// Cabal two spells

    55: {
        letter: "CC",
        icon_class: 'sprite-Great-Curse',
        spell_name: 'Great Cabal',
        type: 'fire',
        manacost: 30,
        healthcost: 0,
        cooldown: 30000,
    },
    56: {
        letter: "CB",
        icon_class: 'sprite-Blood-Ritual',
        spell_name: 'Blood Ritual',
        type: 'fire',
        manacost: 75,
        healthcost: 75,
        cooldown: 100000,
    },
    57: {
        letter: "CW",
        icon_class: 'sprite-Dark-Sword',
        spell_name: 'Dark Sword',
        type: 'fire',
        manacost: 20,
        healthcost: 0,
        cooldown: 40000,
    },
    58: {
        letter: "CD",
        icon_class: 'sprite-Dark-Shield',
        spell_name: 'Dark Shield',
        type: 'fire',
        manacost: 35,
        healthcost: 0,
        cooldown: 30000,
    },

    //// Blood two spells

    66: {
        letter: "BB",
        icon_class: 'sprite-Great-Blood',
        spell_name: 'Great Blood',
        type: 'fire',
        manacost: 20,
        healthcost: 20,
        cooldown: 20000,
    },
    67: {
        letter: "BW",
        icon_class: 'sprite-Blood-Sword',
        spell_name: 'Blood Sword',
        type: 'fire',
        manacost: 0,
        healthcost: 30,
        cooldown: 30000,
    },
    68: {
        letter: "BD",
        icon_class: 'sprite-Blood-Shield',
        spell_name: 'Blood Shield',
        type: 'fire',
        manacost: 0,
        healthcost: 50,
        cooldown: 50000,
    },

    //// Weapon two spells

    77: {
        letter: "WW",
        icon_class: 'sprite-Two-handed-sword',
        spell_name: 'Two-handed Sword',
        type: 'fire',
        manacost: 0,
        healthcost: 0,
        cooldown: 10000,
    },
    78: {
        letter: "WD",
        icon_class: 'sprite-Into-the-Battle',
        spell_name: 'Into the Battle',
        type: 'fire',
        manacost: 0,
        healthcost: 0,
        cooldown: 30000,
    },

    //// Defend two spells

    88: {
        letter: "DD",
        icon_class: 'sprite-Strong-Defence',
        spell_name: 'Strong Defence',
        type: 'fire',
        manacost: 0,
        healthcost: 0,
        cooldown: 60000,
    },

};
