(function() {
    var viewers = [],
        cost = $.getSetIniDbNumber('newboss','cost', 1000),
        coolDown = $.getSetIniDbNumber('newboss', 'cooldown', 300),
        joinTime = $.getSetIniDbNumber('newboss', 'jointime', 120),
        gameState = 0,
        selectedBoss = undefined,
        bosses = [];

    function load() {
        bosses = [];
        $.consoleLn("Loading Bosses...");
        var keys = $.inidb.GetKeyList('bosses', '');
        if(keys.length == 0) {
            // generate bosses
            var obj = {
                minEntries:1,
                maxEntries: 5,
                loot: 50000,
                health: 100,
                attack: 40,
                dodge: 20,
                defense: 10,
                name: "Shamu Jr",
                key: "shamu"
            }
            bosses.push(obj);

            $.inidb.set('bosses', obj.key, JSON.stringify(obj))
        } else {
            var i;
            for(i = 0; i < keys.length; i++) {
                var json = JSON.parse($.inidb.get('bosses', keys[i]));
                json = fixBoss(json);
                $.consoleLn(JSON.stringify(json));
                bosses.push(json);
            }
        }
    }

    function checkUserAlreadyJoined(username) {
        var i;
        for(i in viewers) {
            if(viewers[i] == username) {
                return true;
            }
        }
        return false;
    }

    function startBoss() {
        gameState = 1;
        var t = setTimeout(function() {
            runBoss();
        }, joinTime * 1000);
    }

    function testBoss(bossId, numberOfViewers) {
        var x = 0;
        for(x = 0; x < numberOfViewers; x++) {
            viewers.push("Player_" + x)
        }
        
        var i = 0;
        totalWinners = 0;
        totalWins = 0;
        totalLosses = 0;
        for(i = 0; i < 100; i++){
            selectedBoss =  JSON.parse(JSON.stringify(bosses[bossId]));
            winners = calculateWinners();
            totalWinners += winners.length;
            if (winners.length > 0) {
                totalWins++;
            } else {
                totalLosses++;
            }
        }

        averageWinners = totalWinners / 100;
        viewers = [];
        $.say("After 100 tests with boss " + selectedBoss.name + ", average survivors was: " + parseInt(averageWinners) + " Total Wins: " + totalWins + " Total Losses: " + totalLosses);
    }

    function calculateWinners() {
        viewers = $.arrayShuffle(viewers);
        // for(i in viewers) {
        //     $.consoleLn(viewers[i]);
        // }

        var playerAttack = 20,
            playerDodge = 20,
            playerDefense = 10;

        var lastViewer = 0;
        var viewerHp = 100;
        var attacksSinceBossAttack = 0;
        while(true){
            if(attacksSinceBossAttack >= 3) {
                if(isDodge(playerDodge)) {
                    //$.consoleLn("Player Dodged")
                } else {
                    viewerHp = viewerHp - (selectedBoss.attack - playerDefense);
                    //$.consoleLn("Player Health: " + viewerHp);
                }
                attacksSinceBossAttack = 0;
            }
            

            if(viewerHp <= 0) {
                //get next viewer
                lastViewer++;
                if(lastViewer == viewers.length) {
                    return [];
                }
                
                viewerHp = 100;
            }

            //do Player attack
            attacksSinceBossAttack++;
            if(isDodge(selectedBoss.dodge)) {
                //$.consoleLn("Boss Dodged")
                continue;
            }
            selectedBoss.health = selectedBoss.health - (playerAttack - selectedBoss.defense);
            //$.consoleLn("Boss Health: " + selectedBoss.health);
            if(selectedBoss.health <= 0) {
                break;
            }
        }
        var survivingViewers = []
        var x;
        for(x = lastViewer; x < viewers.length; x++) {
            survivingViewers.push(viewers[x]);
        }
        return survivingViewers;
    }

    function isDodge(dodgeChance) {
        var dodgeVal = $.randRange(1, 100);
        return (dodgeVal < dodgeChance);
    }

    function findBoss() {
        var i = 0;
        var potentialBosses = [];
        $.consoleLn('Viewers: ' + viewers.length);
        for(i = 0; i < bosses.length; i++) {
            if(parseInt(bosses[i].minEntries) <= viewers.length && parseInt(bosses[i].maxEntries) >= viewers.length) {
                potentialBosses.push(JSON.parse(JSON.stringify(bosses[i])));
                $.consoleLn('Added boss to potential: ' + bosses[i].name);
            } else {
                $.consoleLn('Skipped Boss: ' + bosses[i].name + ' Max: ' + bosses[i].maxEntries + ' Min: ' + bosses[i].minEntries)
            }
        }
        if(potentialBosses.length == 0) {
            selectedBoss = undefined;
        }

        selectedBoss = $.randElement(potentialBosses);
    }

    function fixBoss(boss) {
        boss.maxEntries = parseInt(boss.maxEntries);
        boss.minEntries = parseInt(boss.minEntries);
        boss.loot = parseInt(boss.loot);
        boss.health = parseInt(boss.health);
        boss.attack = parseInt(boss.attack);
        boss.dodge = parseInt(boss.dodge);
        boss.defense = parseInt(boss.defense);
        return boss;
    }

    function runBoss() {
        var winners, maxlength = 0, t;
        gameState = 2;
        findBoss();
        if(selectedBoss === undefined) {
            $.say($.lang.get('boss.notenough'));
            endBoss();
            return;
        }
        
        //Starting Message
        $.say($.lang.get('boss.running.1', selectedBoss.name))
         winners = calculateWinners()
         t = setInterval(function() {
            if(gameState === 2) {
                $.say($.lang.get('boss.running.2', selectedBoss.name))
                gameState++;
            } else if (gameState === 3) {
                var winners, maxlength = 0;
                winners = calculateWinners()
                if(winners.length == 0) {
                    $.consoleLn('No survivors');
                    $.say($.lang.get('boss.nosurvivors', selectedBoss.name));
                } else {
                    var i = 0;
                    var prize = parseInt(selectedBoss.loot / winners.length);
                    for(i = 0; i < winners.length; i++) {
                        $.inidb.incr('points', winners[i], prize);
                        $.consoleLn('Points Added');
                        maxlength += winners[i].length;
                    }
                    
                    if((maxlength + 14 + $.channelName.length) > 512) {
                        $.say($.lang.get('boss.tomanyresults', winners.length, $.getPointsString(prize)));
                    } else {
                        $.say($.lang.get('boss.results', winners.join(', '), $.getPointsString(prize)))
                    }
                }
                $.consoleLn('Done');
                endBoss();
                clearInterval(t);
            } else {
                endBoss();
                clearInterval(t);
            }
         }, 7e3);
    }

    function endBoss() {
        $.coolDown.set('boss', true, coolDown, undefined);
        gameState = 0;
        viewers = [];
    }

    function addBoss(key, minEntries, maxEntries, loot, health, attack, dodge, defense, name) {
        var obj = {
            minEntries:minEntries,
            maxEntries: maxEntries,
            loot: loot,
            health: health,
            attack: attack,
            dodge: dodge,
            defense: defense,
            name: name,
            key: key
        }
        $.say("Added boss: " + name);
        obj = fixBoss(obj);
        bosses.push(obj);
        $.inidb.set('bosses', obj.key, JSON.stringify(obj));
        
    }

    function editBoss(id, minEntries, maxEntries, loot, health, attack, dodge, defense, name) {
        var curBoss = bosses[id];
        curBoss.minEntries = minEntries;
        curBoss.maxEntries = maxEntries;
        curBoss.loot = loot;
        curBoss.health = health;
        curBoss.attack = attack;
        curBoss.dodge = dodge;
        curBoss.defense = defense;
        curBoss.name = name;
        curBoss = fixBoss(curBoss);
        $.say("Edited boss: " + name);
        $.inidb.set('bosses', curBoss.key, JSON.stringify(curBoss));
    }

    $.bind('command', function(event) {
        var sender = event.getSender(),
        command = event.getCommand(),
        args = event.getArgs(),
        action = args[0],
        subAction = args[1];
        if(command.equalsIgnoreCase('testboss')) {
            testBoss(parseInt(action), parseInt(subAction));
            return;
        }

        if(command.equalsIgnoreCase('addboss')) {
            if (!args[8]) {
                $.say('usage: !addboss key minEntries maxEntries loot health attack dodge defense name')
            } else {
                addBoss(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8])
            }
            return;
        }

        if(command.equalsIgnoreCase('checkboss')) {
            $.say(bosses[parseInt(action)].name);
            return;
        }

        if(command.equalsIgnoreCase('editboss')) {
            if (!args[7]) {
                $.say('usage: !editboss id minEntries maxEntries loot health attack dodge defense name')
            } else {
                editBoss(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
            }
            return;
        }

        if(command.equalsIgnoreCase('boss')) {
            if(checkUserAlreadyJoined(sender)) {
                $.say($.whisperPrefix(sender) + $.lang.get('boss.alreadyjoined'));
                return;
            }

            if(gameState > 1) {
                $.say($.whisperPrefix(sender) + $.lang.get('boss.notpossible'));
            }

            if(gameState == 0) {
                $.say($.lang.get('boss.start', sender));
                startBoss();
            } else {
                $.say($.lang.get('boss.joined', sender));
            }

            viewers.push(sender);
        }

    })

    $.bind('initReady', function() {
        $.registerChatCommand('./custom/boss.js', 'testboss', 1);
        $.registerChatCommand('./custom/boss.js', 'addboss', 1);
        $.registerChatCommand('./custom/boss.js', 'boss', 7);
        $.registerChatCommand('./custom/boss.js', 'editboss', 1);
        $.registerChatCommand('./custom/boss.js', 'delboss', 1);
        $.registerChatCommand('./custom/boss.js', 'checkboss', 1);
        load();
    });

})()