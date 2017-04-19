Game = {

    /**
     * Keep track of the gameId, which is identical to the ID
     * of the Socket.IO Room used for the players and host to communicate
     *
     */
    gameId: 0,

    /**
     * Contains references to player data
     */
    players : [],

    /**
     * Flag to indicate if a new game is starting.
     * This is used after the first game ends, and players initiate a new game
     * without refreshing the browser windows.
     */
    isNewGame : false,

    /**
     * Keep track of the number of players that have joined the game.
     */
    numPlayersInRoom: 0,

    /**
     * Keep state of the game.
     */
    gameState: {},


    /* *************************************
     *                Setup                *
     * *********************************** */

    /**
     * This runs when the page initially loads.
     */
    init: function () {
        Game.cacheTemplates();
        Game.bindEvents();
        Game.showInitScreen();
        Game.cacheElements();

        // Initialize the fastclick library
        FastClick.attach(document.body);
    },

    /**
     * Create references to on-screen elements used throughout the game.
     */
    cacheTemplates: function () {
        Game.$doc = $(document);

        // Templates
        Game.$gameArea = $('#gameArea');
        Game.$game = $('#game-template').html();
    },

    /**
     * Create some click handlers for the various buttons that appear on-screen.
     */
    bindEvents: function () {

        // Keyboard
        Game.$doc.on('keypress',function (event){
            // console.log(event.keyCode);
            if (event.keyCode === 113){$("#spell1").trigger('click'); $("#spell1").addClass('down');}
            if (event.keyCode === 119){$("#spell2").trigger('click'); $("#spell2").addClass('down');}
            if (event.keyCode === 101){$("#spell3").trigger('click'); $("#spell3").addClass('down');}
            if (event.keyCode === 114){$("#spell4").trigger('click'); $("#spell4").addClass('down');}
            if (event.keyCode === 97){$("#spell5").trigger('click'); $("#spell5").addClass('down');}
            if (event.keyCode === 115){$("#spell6").trigger('click'); $("#spell6").addClass('down');}
            if (event.keyCode === 100){$("#spell7").trigger('click'); $("#spell7").addClass('down');}
            if (event.keyCode === 102){$("#spell8").trigger('click'); $("#spell8").addClass('down');}

            if (event.keyCode === 32){$("#spell_to_cast").trigger('click');}

            if (event.keyCode === 0){Player.resetSpell();}
        });

        Game.$doc.on('keyup',function (){
            $("#spell1").removeClass('down');
            $("#spell2").removeClass('down');
            $("#spell3").removeClass('down');
            $("#spell4").removeClass('down');
            $("#spell5").removeClass('down');
            $("#spell6").removeClass('down');
            $("#spell7").removeClass('down');
            $("#spell8").removeClass('down');
        });


        // Spells
        Game.$doc.on('click', '#spell1', Player.putInCombo);
        Game.$doc.on('click', '#spell2', Player.putInCombo);
        Game.$doc.on('click', '#spell3', Player.putInCombo);
        Game.$doc.on('click', '#spell4', Player.putInCombo);
        Game.$doc.on('click', '#spell5', Player.putInCombo);
        Game.$doc.on('click', '#spell6', Player.putInCombo);
        Game.$doc.on('click', '#spell7', Player.putInCombo);
        Game.$doc.on('click', '#spell8', Player.putInCombo);

        Game.$doc.on('click', '#spell_to_cast', Player.castSpell);
    },

    /**
     * Show the initial Anagrammatix Title Screen
     * (with Start and Join buttons)
     */
    showInitScreen: function() {
        Game.$gameArea.html(Game.$game);
    },


    cacheElements: function(){
        //  Player
        Game.$playerHp = $('#playerhpbar');
        Game.$playerMana = $('#playermanabar');
        Game.$playerName = $('#player_name');

        //  Opponent
        Game.$oppHp = $('#opponenthpbar');
        Game.$oppMana = $('#opponentmanabar');
        Game.$oppName = $('#opponent_name');
    },


    /* *************************************
     *             Game Logic              *
     * *********************************** */


    /**
     * Show the word for the current round on screen.
     * @param data{{round: *, word: *, answer: *, list: Array}}
     */
    gameData : function(data) {
        console.log(data);
        Game.drawPlayerData(data);

    },

    /**
     * Show the word for the current round on screen.
     * @param data{{round: *, word: *, answer: *, list: Array}}
     */
    drawPlayerData : function(data) {
        // Insert the new word into the DOM
        Game.$playerHp.text(data.players[App.mySocketId].hp+" / "+data.players[App.mySocketId].totalHp);
        Game.$playerMana.text(data.players[App.mySocketId].mana+" / "+data.players[App.mySocketId].totalMana);
        Game.$playerName.text(data.players[App.mySocketId].playerName);
    },

    /**
     * Show the word for the current round on screen.
     * @param data{{round: *, word: *, answer: *, list: Array}}
     */
    resetSpellText : function () {
        $("#spell_name").text("");
        $("#spell_type").text("");
        $("#spell_type").attr("class", "");
        $("#spell_damage").text("");
        $("#spell_manacost").text("");
    },

    /**
     * Show the word for the current round on screen.
     * @param data{{round: *, word: *, answer: *, list: Array}}
     */
    drawComboSpell : function(data){
        $("#spell_to_cast").addClass(data.icon_class);
        $("#spell_name").text("Name: "+data.spell_name);
        $("#spell_type").text("Type: "+data.type);
        $("#spell_type").addClass(data.type);
        $("#spell_damage").text("Damage: "+data.value);
        $("#spell_manacost").text("Manacost: "+data.manacost);
        Player.previousComboSpell = data;
    },

    /**
     * Show the word for the current round on screen.
     * @param data{{round: *, word: *, answer: *, list: Array}}
     */
    drawOppHp : function(data){
      $("#playerhpbar").html(data.hp);
    },


};
