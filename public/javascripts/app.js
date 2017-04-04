/**
 * Created by Anton on 19.02.2017.
 */
;
jQuery(function($){
    'use strict';


    /**
     * All the code relevant to Socket.IO is collected in the IO namespace.
     *
     * @type {{init: Function, bindEvents: Function, onConnected: Function, onNewGameCreated: Function, playerJoinedRoom: Function, beginNewGame: Function, onNewWordData: Function, hostCheckAnswer: Function, gameOver: Function, error: Function}}
     */
    var IO = {

        /* *************************************
         *                Setup                *
         * *********************************** */

        /**
         * This is called when the page is displayed. It connects the Socket.IO client
         * to the Socket.IO server
         */
        init: function() {
            IO.socket = io.connect();
            IO.bindEvents();
        },

        /**
         * While connected, Socket.IO will listen to the following events emitted
         * by the Socket.IO server, then run the appropriate function.
         */
        bindEvents : function() {
            IO.socket.on('connected', IO.onConnected );
            IO.socket.on('newGameCreated', IO.onNewGameCreated );
            IO.socket.on('playerJoinedRoom', IO.playerJoinedRoom );
            IO.socket.on('beginNewGame', IO.beginNewGame );
            IO.socket.on('newGameData', IO.onNewGameData);
            IO.socket.on('opponentCombo', IO.onOpponentCombo);
            IO.socket.on('comboSpell', IO.onComboSpell);
            IO.socket.on('updateOppHp', IO.onUpdateOppHp);
        },


        /* *************************************
         *          Socket Functions           *
         * *********************************** */

        /**
         * The client is successfully connected!
         */
        onConnected : function(data) {
            // Cache a copy of the client's socket.IO session ID on the App
            App.mySocketId = IO.socket.id;
            // console.log(data.message);
        },

        /**
         * A new game has been created and a random game ID has been generated.
         * @param data {{ gameId: int, mySocketId: * }}
         */
        onNewGameCreated : function(data) {
            App.gameInit(data);
        },

        /**
         * A player has successfully joined the game.
         * @param data {{playerName: string, gameId: int, mySocketId: int}}
         */
        playerJoinedRoom : function(data) {
            // When a player joins a room, do the updateWaitingScreen funciton.
            // There are two versions of this function: one for the 'host' and
            // another for the 'player'.
            //
            // So on the 'host' browser window, the App.Host.updateWiatingScreen function is called.
            // And on the player's browser, App.Player.updateWaitingScreen is called.
            App.updateWaitingScreen(data);
        },

        /**
         * Both players have joined the game.
         * @param data
         */
        beginNewGame : function(data) {
            App.gameCountdown(data);
        },

        /**
         * A new set of words for the round is returned from the server.
         * @param data
         */
        onNewGameData : function(data) {
            // Update the current round
            App.gameState = data;

            // Change the word for the Host and Player
            App.newGameData(data);
        },

        onOpponentCombo: function(data){
            console.log(data);
        },

        onComboSpell: function(data){
            App.drawComboSpell(data);
        },

        onUpdateOppHp: function(data){
          App.drawOppHp(data);
        }

    };


    var App = {

        /**
         * Keep track of the gameId, which is identical to the ID
         * of the Socket.IO Room used for the players and host to communicate
         *
         */
        gameId: 0,

        /**
         * The Socket.IO socket object identifier. This is unique for
         * each player and host. It is generated when the browser initially
         * connects to the server when the page loads for the first time.
         */
        mySocketId: '',

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
            App.cacheElements();
            App.bindEvents();
            App.showInitScreen();

            // Initialize the fastclick library
            FastClick.attach(document.body);
        },

        /**
         * Create references to on-screen elements used throughout the game.
         */
        cacheElements: function () {
            App.$doc = $(document);

            // Templates
            App.$gameArea = $('#gameArea');
            App.$templateIntroScreen = $('#intro-screen-template').html();
            App.$templateNewGame = $('#create-game-template').html();
            App.$templateWaitGame= $('#wait-game-template').html();
            App.$templateJoinGame = $('#join-game-template').html();
            App.$countGame = $('#count-template').html();
            App.$game = $('#game-template').html();
            App.$playerHp = $('#playerhpbar');
            App.$playerMana = $('#playermanabar');
            App.$oppHp = $('#opponenthpbar');
            App.$oppMana = $('#opponentmanabar');
        },

        /**
         * Create some click handlers for the various buttons that appear on-screen.
         */
        bindEvents: function () {
            // Player
            App.$doc.on('click', '#btnCreateGame', App.Player.onCreateClick);
            App.$doc.on('click', '#btnCreate', App.Player.onCreateGameClick);
            App.$doc.on('click', '#btnJoinGame', App.Player.onJoinClick);
            App.$doc.on('click', '#btnStart',App.Player.onPlayerStartClick);

            // Keyboard
            App.$doc.on('keypress',function (event){
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

                if (event.keyCode === 0){App.Player.resetSpell();}
            });

            App.$doc.on('keyup',function (){
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
            App.$doc.on('click', '#spell1', App.Player.putInCombo);
            App.$doc.on('click', '#spell2', App.Player.putInCombo);
            App.$doc.on('click', '#spell3', App.Player.putInCombo);
            App.$doc.on('click', '#spell4', App.Player.putInCombo);
            App.$doc.on('click', '#spell5', App.Player.putInCombo);
            App.$doc.on('click', '#spell6', App.Player.putInCombo);
            App.$doc.on('click', '#spell7', App.Player.putInCombo);
            App.$doc.on('click', '#spell8', App.Player.putInCombo);

            App.$doc.on('click', '#spell_to_cast', App.Player.castSpell);
        },

        /**
         * Show the initial Anagrammatix Title Screen
         * (with Start and Join buttons)
         */
        showInitScreen: function() {
            App.$gameArea.html(App.$templateIntroScreen);
            App.doTextFit('.title');
        },


        /* *************************************
         *             Game Logic              *
         * *********************************** */

        /**
         * The Host screen is displayed for the first time.
         * @param data{{ gameId: int, mySocketId: * }}
         */
        gameInit: function (data) {
            App.gameId = data.gameId;
            App.mySocketId = data.mySocketId;

            App.displayWaitGameScreen(data);
            // console.log("Game started with ID: " + App.gameId + ' by host: ' + App.mySocketId);
        },

        /**
         * Show the Host screen containing the game URL and unique game ID
         */
        displayWaitGameScreen : function(data) {
            // Fill the game screen with the appropriate HTML
            App.$gameArea.html(App.$templateWaitGame);

            // Display the URL on screen
            $('#gameURL').text(window.location.href);
            App.doTextFit('#gameURL');

            // Show the gameId / room id on screen
            $('#spanNewGameCode').text(App.gameId);

            // Add players to the screen
            $('#playersWaiting')
                .append('<p>Player ' + data.playerName + ' joined the game.</p>');

            // Store the new player's data on the Host.
            App.players = data.players;

            // Increment the number of players in the room
            App.numPlayersInRoom += 1;

            console.log(App);

            // If two players have joined, start the game!
            if (App.numPlayersInRoom === 1) {
                //console.log('Room is full. Almost ready!');

                // Let the server know that two players are present.
                IO.socket.emit('roomFull',App.gameId);
            }
        },

        /**
         * Update the Host screen when the first player joins
         * @param data{{playerName: string}}
         */
        updateWaitingScreen: function(data) {
            // If this is a restarted game, show the screen.
            if ( App.isNewGame ) {
                App.displayWaitGameScreen();
            }
            // Update host screen
            $('#playersWaiting')
                .append('<p>Player ' + data.playerName + ' joined the game.</p>');

            // Store the new player's data on the Host.
            App.players = data.players;
            App.gameId = data.gameId;

            // Increment the number of players in the room
            App.numPlayersInRoom += 1;

            console.log(App);

            // If two players have joined, start the game!
            if (App.numPlayersInRoom === 1) {
                //console.log('Room is full. Almost ready!');

                // Let the server know that two players are present.
                IO.socket.emit('roomFull',App.gameId);
            }
        },

        /**
         * Show the countdown screen
         */
        gameCountdown : function() {

            // Prepare the game screen with new HTML
            App.$gameArea.html(App.$countGame);
            App.doTextFit('#hostWord');

            // Begin the on-screen countdown timer
            var $secondsLeft = $('#hostWord');
            App.countDown( $secondsLeft, 5, function(){
                IO.socket.emit('hostCountdownFinished', App.gameId);
            });
        },


        /**
         * Show the word for the current round on screen.
         * @param data{{round: *, word: *, answer: *, list: Array}}
         */
        newGameData : function(data) {
            // Insert the new word into the DOM
            var self = this;
            console.log(data);
            App.$playerHp.text("123");
            data.players.forEach(function(player){
              if(player.mySocketId == App.mySocketId){
                console.log(App.$playerHp);
                App.$playerHp.text(player.hp);
                App.$playerMana.text(player.mana);
              }else{
                App.$oppHp.text(player.hp);
                App.$oppMana.text(player.mana);
              }
            })
            App.$gameArea.html(App.$game);

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
            App.Player.previousComboSpell = data;
        },

        /**
         * Show the word for the current round on screen.
         * @param data{{round: *, word: *, answer: *, list: Array}}
         */
        drawOppHp : function(data){
          $("#playerhpbar").html(data.hp);
        },



        /* *****************************
         *        PLAYER CODE        *
         ***************************** */

        Player : {

            /**
             * A reference to the socket ID of the Host
             */
            SocketId: '',

            /**
             * The player's name entered on the 'Join' screen.
             */
            myName: '',

            /**
             * The player's combo spell.
             */
            combo: [],

            /**
             * The player's combo spell.
             */
            comboSpell: {},

            /**
             * The player's previous combo spell.
             */
            previousComboSpell: {},

            /**
             * The player's target.
             */
            target: {},

            /**
             * The player's hp.
             */
            hp: 0,

            /**
             * The player's mana.
             */
            mana: 0,

            /**
             * The player's target.
             */
            buffs: [],

            /**
             * The player's target.
             */
            debuffs: [],

            /**
             * The player's target.
             */
            summons: [],



            /* *************************************
             *           Player Actions            *
             * *********************************** */

            /**
             * Handler for the "Start" button on the Title Screen.
             */
            onCreateClick: function () {
                // console.log('Clicked "Create A Game"');
                App.$gameArea.html(App.$templateNewGame);
                //IO.socket.emit('playerCreateNewGame');
            },

            /**
             * Click handler for the 'JOIN' button
             */
            onJoinClick: function () {
                //console.log('Clicked "Join A Game"');

                // Display the Join Game HTML on the player's screen.
                App.$gameArea.html(App.$templateJoinGame);
            },

            /**
             * Click handler for the 'Create' button
             */
            onCreateGameClick: function () {
                //console.log('Player clicked "Create"');

                //collect data to send to the server
                var data = {
                    playerName : $('#inputPlayerName').val() || 'anon',
                    hp: 2000,
                    mana: 1000,
                };

                // Send the gameId and playerName to the server
                IO.socket.emit('playerCreateNewGame', data);

                // Set the appropriate properties for the current player.
                //App.myRole = 'Player';
                App.Player.myName = data.playerName;

                App.$gameArea.html(App.$templateWaitGame);
            },


            /**
             * The player entered their name and gameId (hopefully)
             * and clicked Start.
             */
            onPlayerStartClick: function() {
                //console.log('Player clicked "Start"');

                //collect data to send to the server
                var data = {
                    gameId : +($('#inputGameId').val()) || null,
                    playerName : $('#inputPlayerName').val() || 'anon'
                };

                // Send the gameId and playerName to the server
                IO.socket.emit('playerJoinGame', data);

                // Set the appropriate properties for the current player.
                //App.myRole = 'Player';
                App.Player.myName = data.playerName;
                App.Player.hp = data.hp;
                App.Player.mana = data.mana;

                App.$gameArea.html(App.$templateWaitGame);
            },

            putInCombo: function() {
                console.log($(this).attr('data-spell'));
                console.log($(this).attr('data-class'));
                var spell = $(this).attr('data-spell');
                var spell_class = $(this).attr('data-class');

                var i = 0;
                //while (i != 3) {
                while (i != 2) {
                    if(!App.Player.combo[i]){
                        $("#"+i+"_spell").addClass(spell_class);
                        App.Player.combo[i] = {
                            spell: spell,
                            icon_class: spell_class,
                        };

                        // console.log(App.Player.combo);

                        if(App.Player.previousComboSpell.spell_name) {
                            $("#spell_to_cast").removeClass(App.Player.previousComboSpell.icon_class);
                            App.resetSpellText();
                        }

                        break;
                    }
                    //if(App.Player.combo[2]){
                    if(App.Player.combo[1]){
                        $("#0_spell").removeClass(App.Player.combo[0].icon_class);
                        $("#1_spell").removeClass(App.Player.combo[1].icon_class);
                        //$("#2_spell").removeClass(App.Player.combo[2].icon_class);

                        $("#0_spell").addClass(App.Player.combo[1].icon_class);
                        $("#1_spell").addClass(spell_class);
                        //$("#1_spell").addClass(App.Player.combo[2].icon_class);
                        //$("#2_spell").addClass(spell_class);

                        App.Player.combo[0] = App.Player.combo[1];
                        App.Player.combo[1] = {
                            spell: spell,
                            icon_class: spell_class,
                        };
                        //App.Player.combo[1] = App.Player.combo[2];
                        //App.Player.combo[2] = {
                        //    spell: spell,
                        //    icon_class: spell_class,
                        //};

                        // console.log(App.Player.previousComboSpell);

                        if(App.Player.previousComboSpell.spell_name) {
                            $("#spell_to_cast").removeClass(App.Player.previousComboSpell.icon_class);
                            App.resetSpellText();
                        }

                        //console.log(App.Player.combo);

                        break;
                    }
                    i++;
                }

                IO.socket.emit('playerCastSpell', App.Player.combo);
            },

            castSpell: function(){
                console.log('cast combo spell');
                console.log(App.Player.previousComboSpell);
                App.Player.previousComboSpell.target = App.players[0];
                IO.socket.emit('playerCastComboSpell', App.Player.previousComboSpell);
            },

            resetSpell: function(){
              if(App.Player.combo[0])$("#0_spell").removeClass(App.Player.combo[0].icon_class);
              if(App.Player.combo[1])$("#1_spell").removeClass(App.Player.combo[1].icon_class);
              // if(combo[2])$("#2_spell").removeClass(combo[2].icon_class);
              $("#spell_to_cast").removeClass(App.Player.previousComboSpell.icon_class);
              App.resetSpellText();
              App.Player.combo = [];
              App.Player.comboSpell = {};
              IO.socket.emit('playerCastSpell', App.Player.combo);
            }

        },


        /* **************************
         UTILITY CODE
         ************************** */

        /**
         * Display the countdown timer on the Host screen
         *
         * @param $el The container element for the countdown timer
         * @param startTime
         * @param callback The function to call when the timer ends.
         */
        countDown : function( $el, startTime, callback) {

            // Display the starting time on the screen.
            $el.text(startTime);
            App.doTextFit('#hostWord');

            // console.log('Starting Countdown...');

            // Start a 1 second timer
            var timer = setInterval(countItDown,1000);

            // Decrement the displayed timer value on each 'tick'
            function countItDown(){
                startTime -= 1
                $el.text(startTime);
                App.doTextFit('#hostWord');

                if( startTime <= 0 ){
                    // console.log('Countdown Finished.');

                    // Stop the timer and do the callback.
                    clearInterval(timer);
                    callback();
                    return;
                }
            }

        },

        /**
         * Make the text inside the given element as big as possible
         * See: https://github.com/STRML/textFit
         *
         * @param el The parent element of some text
         */
        doTextFit : function(el) {
            textFit(
                $(el)[0],
                {
                    alignHoriz:true,
                    alignVert:false,
                    widthOnly:true,
                    reProcess:true,
                    maxFontSize:300
                }
            );
        }

    };

    IO.init();
    App.init();

}($));
