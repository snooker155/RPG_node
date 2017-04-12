App = {

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
    },

    /**
     * Create some click handlers for the various buttons that appear on-screen.
     */
    bindEvents: function () {
        // Player
        App.$doc.on('click', '#btnCreateGame', Player.onCreateClick);
        App.$doc.on('click', '#btnCreate', Player.onCreateGameClick);
        App.$doc.on('click', '#btnJoinGame', Player.onJoinClick);
        App.$doc.on('click', '#btnStart', Player.onPlayerStartClick);
    },

    /**
     * Show the initial Anagrammatix Title Screen
     * (with Start and Join buttons)
     */
    showInitScreen: function() {
        App.$gameArea.html(Game.$templateIntroScreen);
        App.doTextFit('.title');
    },


    /* *************************************
     *             Game Logic              *
     * *********************************** */

    /**
     * The Host screen is displayed for the first time.
     * @param data{{ gameId: int, mySocketId: * }}
     */
    appInit: function (data) {
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
        App.$gameArea.html(Game.$countGame);
        App.doTextFit('#hostWord');

        // Begin the on-screen countdown timer
        var $secondsLeft = $('#hostWord');
        App.countDown( $secondsLeft, 5, function(){
            IO.socket.emit('hostCountdownFinished', App.gameId);
        });
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
        Game.doTextFit('#hostWord');

        // console.log('Starting Countdown...');

        // Start a 1 second timer
        var timer = setInterval(countItDown,1000);

        // Decrement the displayed timer value on each 'tick'
        function countItDown(){
            startTime -= 1
            $el.text(startTime);
            Game.doTextFit('#hostWord');

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
