/* *****************************
 *        PLAYER CODE        *
 ***************************** */

Player = {

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
     *       Player App Actions            *
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
        };

        // Send the gameId and playerName to the server
        IO.socket.emit('playerCreateNewGame', data);

        // Set the appropriate properties for the current player.
        //App.myRole = 'Player';
        Player.myName = data.playerName;

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
        Player.myName = data.playerName;

        App.$gameArea.html(App.$templateWaitGame);
    },



    /* *************************************
     *       Player Game Actions           *
     * *********************************** */

    putInCombo: function() {
        console.log($(this).attr('data-spell'));
        console.log($(this).attr('data-class'));
        var spell = $(this).attr('data-spell');
        var spell_class = $(this).attr('data-class');

        var i = 0;
        //while (i != 3) {
        while (i != 2) {
            if(!Player.combo[i]){
                $("#"+i+"_spell").addClass(spell_class);
                Player.combo[i] = {
                    spell: spell,
                    icon_class: spell_class,
                };

                // console.log(App.Player.combo);

                if(Player.previousComboSpell.spell_name) {
                    $("#spell_to_cast").removeClass(Player.previousComboSpell.icon_class);
                    Game.resetSpellText();
                }

                break;
            }
            //if(App.Player.combo[2]){
            if(Player.combo[1]){
                $("#0_spell").removeClass(Player.combo[0].icon_class);
                $("#1_spell").removeClass(Player.combo[1].icon_class);
                //$("#2_spell").removeClass(App.Player.combo[2].icon_class);

                $("#0_spell").addClass(Player.combo[1].icon_class);
                $("#1_spell").addClass(spell_class);
                //$("#1_spell").addClass(App.Player.combo[2].icon_class);
                //$("#2_spell").addClass(spell_class);

                Player.combo[0] = Player.combo[1];
                Player.combo[1] = {
                    spell: spell,
                    icon_class: spell_class,
                };
                //App.Player.combo[1] = App.Player.combo[2];
                //App.Player.combo[2] = {
                //    spell: spell,
                //    icon_class: spell_class,
                //};

                // console.log(App.Player.previousComboSpell);

                if(Player.previousComboSpell.spell_name) {
                    $("#spell_to_cast").removeClass(Player.previousComboSpell.icon_class);
                    Game.resetSpellText();
                }

                //console.log(App.Player.combo);

                break;
            }
            i++;
        }

        IO.socket.emit('playerCastSpell', Player.combo);
    },

    castSpell: function(){
        console.log('cast combo spell');
        console.log(Player.previousComboSpell);
        Player.previousComboSpell.target = Game.players[0];
        IO.socket.emit('playerCastComboSpell', Player.previousComboSpell);
    },

    resetSpell: function(){
      if(Player.combo[0])$("#0_spell").removeClass(Player.combo[0].icon_class);
      if(Player.combo[1])$("#1_spell").removeClass(Player.combo[1].icon_class);
      // if(combo[2])$("#2_spell").removeClass(combo[2].icon_class);
      $("#spell_to_cast").removeClass(Player.previousComboSpell.icon_class);
      Game.resetSpellText();
      Player.combo = [];
      Player.comboSpell = {};
      IO.socket.emit('playerCastSpell', Player.combo);
    }

}
