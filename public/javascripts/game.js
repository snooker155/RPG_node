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
            if (event.keyCode === 113 && !$("#spell1").hasClass('cooldown')){$("#spell1").trigger('click'); $("#spell1").addClass('down');}
            if (event.keyCode === 119 && !$("#spell2").hasClass('cooldown')){$("#spell2").trigger('click'); $("#spell2").addClass('down');}
            if (event.keyCode === 101 && !$("#spell3").hasClass('cooldown')){$("#spell3").trigger('click'); $("#spell3").addClass('down');}
            if (event.keyCode === 114 && !$("#spell4").hasClass('cooldown')){$("#spell4").trigger('click'); $("#spell4").addClass('down');}
            if (event.keyCode === 97 && !$("#spell5").hasClass('cooldown')){$("#spell5").trigger('click'); $("#spell5").addClass('down');}
            if (event.keyCode === 115 && !$("#spell6").hasClass('cooldown')){$("#spell6").trigger('click'); $("#spell6").addClass('down');}
            if (event.keyCode === 100 && !$("#spell7").hasClass('cooldown')){$("#spell7").trigger('click'); $("#spell7").addClass('down');}
            if (event.keyCode === 102 && !$("#spell8").hasClass('cooldown')){$("#spell8").trigger('click'); $("#spell8").addClass('down');}

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
        Game.$playerHp = $('#playerhp');
        Game.$playerHpBar = $('#playerhpbar');
        Game.$playerMana = $('#playermana');
        Game.$playerManaBar = $('#playermanabar');
        Game.$playerName = $('#player_name');

        Game.$playerBuffs = $('#player_buffs');
        Game.$infoLog = $('#infolog');

        Game.$playerBattleCell_1 = $("#player_battlecell_1");
        Game.$playerBattleCell_2 = $("#player_battlecell_2");
        Game.$playerBattleCell_3 = $("#player_battlecell_3");

        Game.$comboSpell = $("#spell_to_cast");
        Game.$comboSpellName = $("#spell_name");
        Game.$comboSpellType = $("#spell_type");
        Game.$comboSpellSchool = $("#spell_school");
        Game.$comboSpellDamage = $("#spell_damage");
        Game.$comboSpellManacost = $("#spell_manacost");

        //  Opponent
        Game.$oppHp = $('#opponenthp');
        Game.$oppHpBar = $('#opponenthpbar');
        Game.$oppMana = $('#opponentmana');
        Game.$oppManaBar = $('#opponentmanabar');
        Game.$oppName = $('#opponent_name');

        Game.$opponentBuffs = $('#opponent_buffs');
        Game.$opponentLog = $('#opponent_log');

        Game.$oppBattleCell_1 = $("#opponent_battlecell_1");
        Game.$oppBattleCell_2 = $("#opponent_battlecell_2");
        Game.$oppBattleCell_3 = $("#opponent_battlecell_3");

        Game.$oppSpell_1 = $("#opp_spell_1");
        Game.$oppSpell_2 = $("#opp_spell_2");
        Game.$oppSpell_3 = $("#opp_spell_3");
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
        Game.drawBaseSpells(data);
        Game.drawPlayerData(data);
        Game.drawOppData(data);
        Game.drawBuffs(data);
        Game.drawSummons(data);
    },

    /**
     * Show the word for the current round on screen.
     * @param data{{round: *, word: *, answer: *, list: Array}}
     */
    setLog : function(data) {
      Game.$opponentLog.prepend("</br>");
      Game.$infoLog.prepend("</br>");
    },

    /**
     * Show the word for the current round on screen.
     * @param data{{round: *, word: *, answer: *, list: Array}}
     */
    drawBaseSpells : function(data) {
        // Insert the new word into the DOM
        console.log(data);
        for( var spell in data.players[App.mySocketId].baseCooldowns){
          if(data.players[App.mySocketId].baseCooldowns[spell].onCooldown){
            $("#spell"+spell).addClass('cooldown');
          }else{
            $("#spell"+spell).removeClass('cooldown');
          }
        }
    },

    /**
     * Show the word for the current round on screen.
     * @param data{{round: *, word: *, answer: *, list: Array}}
     */
    drawPlayerData : function(data) {
        // Insert the new word into the DOM
        Game.$playerHp.text(data.players[App.mySocketId].hp+" / "+data.players[App.mySocketId].totalHp);
        Game.$playerHpBar.css('width', data.players[App.mySocketId].hp / data.players[App.mySocketId].totalHp * 100+"%");
        Game.$playerMana.text(data.players[App.mySocketId].mana+" / "+data.players[App.mySocketId].totalMana);
        Game.$playerManaBar.css('width', data.players[App.mySocketId].mana / data.players[App.mySocketId].totalMana * 100+"%");
        Game.$playerName.text(data.players[App.mySocketId].playerName);
    },

    /**
     * Show the word for the current round on screen.
     * @param data{{round: *, word: *, answer: *, list: Array}}
     */
    drawOppData : function(data) {
        // Insert the new word into the DOM
        if(App.oppSocketId != ""){
          Game.$oppHp.text(data.players[App.oppSocketId].hp+" / "+data.players[App.oppSocketId].totalHp);
          Game.$oppHpBar.css('width', data.players[App.oppSocketId].hp / data.players[App.oppSocketId].totalHp * 100+"%");
          Game.$oppMana.text(data.players[App.oppSocketId].mana+" / "+data.players[App.oppSocketId].totalMana);
          Game.$oppManaBar.css('width', data.players[App.oppSocketId].mana / data.players[App.oppSocketId].totalMana * 100+"%");
          Game.$oppName.text(data.players[App.oppSocketId].playerName);
        }
    },

    /**
     * Show the word for the current round on screen.
     * @param data{{round: *, word: *, answer: *, list: Array}}
     */
    drawBuffs : function(data) {
        if(data.players[App.mySocketId].buffs.length != 0){
          Game.$playerBuffs.html("");
          data.players[App.mySocketId].buffs.forEach(function(buff){
            Game.$playerBuffs.append("<div class=\"buffslot "+buff.type+"\">"+buff.value+"</div>")
          });
        }

        if(App.oppSocketId != "" && data.players[App.oppSocketId].buffs.length != 0){
          Game.$opponentBuffs.html("");
          data.players[App.oppSocketId].buffs.forEach(function(buff){
            Game.$opponentBuffs.append("<div class=\"buffslot "+buff.type+"\">"+buff.value+"</div>")
          });
        }
    },

    /**
     * Show the word for the current round on screen.
     * @param data{{round: *, word: *, answer: *, list: Array}}
     */
    drawSummons : function(data) {
        Game.$playerBattleCell_1.html("");
        Game.$playerBattleCell_2.html("");
        Game.$playerBattleCell_3.html("");

        if(data.players[App.mySocketId].summons.length != 0){
          Game.$playerBattleCell_1.html("<div class=\"summon\"><div class=\"summon_img\"><div class=\"summonhpbar\">"+data.players[App.mySocketId].summons[0].hp+" / "+data.players[App.mySocketId].summons[0].totalHp+"</div><img class=\"mobsprites boss9\"></div><div class=\"summon_buffs\"><div class=\"summonbuffslot\"></div><div class=\"summonbuffslot\"></div></div></div>");

          if(data.players[App.mySocketId].summons[1]){
            Game.$playerBattleCell_2.html("<div class=\"summon\"><div class=\"summon_img\"><div class=\"summonhpbar\">"+data.players[App.mySocketId].summons[1].hp+" / "+data.players[App.mySocketId].summons[1].totalHp+"</div><img class=\"mobsprites boss9\"></div><div class=\"summon_buffs\"><div class=\"summonbuffslot\"></div><div class=\"summonbuffslot\"></div></div></div>");
          }

          if(data.players[App.mySocketId].summons[2]){
            Game.$playerBattleCell_3.html("<div class=\"summon\"><div class=\"summon_img\"><div class=\"summonhpbar\">"+data.players[App.mySocketId].summons[2].hp+" / "+data.players[App.mySocketId].summons[2].totalHp+"</div><img class=\"mobsprites boss9\"></div><div class=\"summon_buffs\"><div class=\"summonbuffslot\"></div><div class=\"summonbuffslot\"></div></div></div>");
          }
        }

        Game.$oppBattleCell_1.html("");
        Game.$oppBattleCell_2.html("");
        Game.$oppBattleCell_3.html("");

        if(App.oppSocketId != "" && data.players[App.oppSocketId].summons.length != 0){
          Game.$oppBattleCell_1.html("<div class=\"summon\"><div class=\"summon_img\"><div class=\"summonhpbar\">"+data.players[App.oppSocketId].summons[0].hp+" / "+data.players[App.oppSocketId].summons[0].totalHp+"</div><img class=\"mobsprites boss9\"></div><div class=\"summon_buffs\"><div class=\"summonbuffslot\"></div><div class=\"summonbuffslot\"></div></div></div>");

          if(data.players[App.oppSocketId].summons[1]){
            Game.$oppBattleCell_2.html("<div class=\"summon\"><div class=\"summon_img\"><div class=\"summonhpbar\">"+data.players[App.oppSocketId].summons[1].hp+" / "+data.players[App.oppSocketId].summons[1].totalHp+"</div><img class=\"mobsprites boss9\"></div><div class=\"summon_buffs\"><div class=\"summonbuffslot\"></div><div class=\"summonbuffslot\"></div></div></div>");
          }

          if(data.players[App.oppSocketId].summons[2]){
            Game.$oppBattleCell_3.html("<div class=\"summon\"><div class=\"summon_img\"><div class=\"summonhpbar\">"+data.players[App.oppSocketId].summons[2].hp+" / "+data.players[App.oppSocketId].summons[2].totalHp+"</div><img class=\"mobsprites boss9\"></div><div class=\"summon_buffs\"><div class=\"summonbuffslot\"></div><div class=\"summonbuffslot\"></div></div></div>");
          }
        }
    },

    /**
     * Show the word for the current round on screen.
     * @param data{{round: *, word: *, answer: *, list: Array}}
     */
    resetSpell : function () {
      Game.$comboSpell.attr('class', 'spellsprite');
      Game.$comboSpellName.text("");
      Game.$comboSpellType.text("");
      Game.$comboSpellSchool.text("").attr('class', '');
      Game.$comboSpellDamage.text("");
      Game.$comboSpellManacost.text("");
    },

    /**
     * Show the word for the current round on screen.
     * @param data{{round: *, word: *, answer: *, list: Array}}
     */
    drawComboSpell : function(data){
      console.log(data);
      Player.comboSpell = data;
      if(data.onCooldown){
        Game.$comboSpell.attr('class', 'spellsprite '+data.icon_class+' cooldown');
      }else{
        Game.$comboSpell.attr('class', 'spellsprite '+data.icon_class);
      }
      Game.$comboSpellName.text("Name: "+data.spell_name);
      Game.$comboSpellType.text("Type: "+data.type);
      Game.$comboSpellSchool.text("School: "+data.school).attr('class', data.school);
      Game.$comboSpellDamage.text("Damage: "+data.value);
      Game.$comboSpellManacost.text("Manacost: "+data.manacost);
    },

    /**
     * Show the word for the current round on screen.
     * @param data{{round: *, word: *, answer: *, list: Array}}
     */
    drawOppCombo : function(data){
      if(data[0]){
        Game.$oppSpell_1.attr('class', 'spellsprite '+data[0].icon_class);
      }else{
        Game.$oppSpell_1.attr('class', 'spellsprite');
      }
      if(data[1]){
        Game.$oppSpell_2.attr('class', 'spellsprite '+data[1].icon_class);
      }else{
        Game.$oppSpell_2.attr('class', 'spellsprite');
      }
    },


};
