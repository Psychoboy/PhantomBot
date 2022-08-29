/*
 * Copyright (C) 2016-2022 phantombot.github.io/PhantomBot
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function() {
    var winGainPercent = $.getSetIniDbNumber('gambling', 'winGainPercent', 30),
        winRange = $.getSetIniDbNumber('gambling', 'winRange', 50),
        max = $.getSetIniDbNumber('gambling', 'max', 100),
        min = $.getSetIniDbNumber('gambling', 'min', 5),
        jackpot = $.getSetIniDbNumber('gambling', 'jackpot', 1000),
        jackpotDefault = $.getSetIniDbNumber('gambling', 'jackpotDefault', 1000),
        jackpotSpot = $.getSetIniDbNumber('gambling', 'jackpotSpot', 69),
        gain = Math.abs(winGainPercent / 100);

    /**
     * @function gamble
     *
     * @param {int amout}
     * @param {string} sender
     */
    function gamble(sender, amount) {
        var winnings = 0,
            range = $.randRange(1, 100);

        if ($.getUserPoints(sender) < amount) {
            $.say($.whisperPrefix(sender) + $.lang.get('gambling.need.points', $.pointNameMultiple));
            return;
        }

        if (max < amount) {
            $.say($.whisperPrefix(sender) + $.lang.get('gambling.error.max', $.getPointsString(max)));
            return;
        }

        if (min > amount) {
            $.say($.whisperPrefix(sender) + $.lang.get('gambling.error.min', $.getPointsString(min)));
            return;
        }

        if(range == jackpotSpot) {
            jackpotWinning = Math.floor(jackpot * (amount / max));
            winnings = Math.floor(amount + (amount * gain)) + jackpotWinning;
            jackpot = jackpotWinning - jackpot;
            if(jackpot <= jackpotDefault) {
                jackpot = jackpotDefault
            }
            updateJackpot(jackpot, reset);
            $.say($.lang.get('gambling.jackpot.won', $.resolveRank(sender), range, $.getPointsString(winnings - amount), $.getPointsString($.getUserPoints(sender) + (winnings - amount)), $.gameMessages.getWin(sender, 'gamble')));
            $.inidb.decr('points', sender, amount);
            $.inidb.incr('points', sender, winnings);
        } else if (range <= winRange) {
            $.say($.lang.get('gambling.lost', $.resolveRank(sender), range, $.getPointsString(amount), $.getPointsString($.getUserPoints(sender) - amount), $.gameMessages.getLose(sender, 'gamble')));
            $.inidb.decr('points', sender, amount);
            updateJackpot(amount / 2);
        } else {
            winnings = Math.floor(amount + (amount * gain));
            $.say($.lang.get('gambling.won', $.resolveRank(sender), range, $.getPointsString(winnings - amount), $.getPointsString($.getUserPoints(sender) + (winnings - amount)), $.gameMessages.getWin(sender, 'gamble')));
            $.inidb.decr('points', sender, amount);
            $.inidb.incr('points', sender, winnings);
        }
    }

    function updateJackpot(amount, reset) {
        if (reset) {
            jackpot = amount;
        } else {
            jackpot += Math.floor(amount);
        }
        $.inidb.set('gambling', 'jackpot', jackpot);
    }

    function getUserMaxBet(username) {
        var userPoints = $.getUserPoints(username);
        if(userPoints > max) {
            return max;
        }
        return userPoints;
    }

    $.bind('command', function(event) {
        var sender = event.getSender(),
            command = event.getCommand(),
            args = event.getArgs(),
            action = args[0];

        /**
         * @commandpath gamble [amount] - Gamble your points.
         */
        if (command.equalsIgnoreCase('gamble')) {

            amount = action;
            if (action.equalsIgnoreCase('max')) {
                amount = getUserMaxBet(sender);
            }

            if (!parseInt(amount)) {
                $.say($.whisperPrefix(sender) + $.lang.get('gambling.usage'));
                return;
            } else {
                points = parseInt(amount);
            }

            gamble(sender, points);
            return;
        }

        if(command.equalsIgnoreCase('jackpot')) {
            $.say($.whisperPrefix(sender) + $.lang.get('gambingling.jackpot', jackpot));
        }

        if(command.equalsIgnoreCase('gamblesetjackpotspot')) {
            if (action === undefined || isNaN(parseInt(action)) || action < 1) {
                return;
            }

            jackpotSpot = parseInt(action);
            $.inidb.set('gambling','jackpotSpot', jackpotSpot);

            $.say($.whisperPrefix(sender) + $.lang.get('gambling.admin.jackpotspotupdated', jackpotSpot));
        }

        if(command.equalsIgnoreCase('jackpotdefault')) {
            if (action === undefined || isNaN(parseInt(action)) || action < 1) {
                return;
            }

            jackpotDefault = parseInt(action);
            $.inidb.set('gambling','jackpotDefault', jackpotDefault);

            $.say($.whisperPrefix(sender) + $.lang.get('gambling.admin.jackpotdefault', jackpotDefault));
        }

        /**
         * @commandpath gamblesetmax [amount] - Set how many points people can gamble.
         */
        if (command.equalsIgnoreCase('gamblesetmax')) {
            if (action === undefined || isNaN(parseInt(action)) || action < 1) {
                $.say($.whisperPrefix(sender) + $.lang.get('gambling.set.max.usage'));
                return;
            }
            max = action;
            $.inidb.set('gambling', 'max', max);
            $.say($.whisperPrefix(sender) + $.lang.get('gambling.set.max', $.getPointsString(max)));
        }

        /**
         * @commandpath gamblesetmin [amount] - Set the minumum amount of points people can gamble.
         */
        if (command.equalsIgnoreCase('gamblesetmin')) {
            if (action === undefined || isNaN(parseInt(action)) || action < 1) {
                $.say($.whisperPrefix(sender) + $.lang.get('gambling.set.min.usage'));
                return;
            }
            min = action;
            $.inidb.set('gambling', 'min', min);
            $.say($.whisperPrefix(sender) + $.lang.get('gambling.set.min', $.getPointsString(min)));
        }

        /**
         * @commandpath gamblesetwinningrange [range] - Set the winning range from 0-100.
         */
        if (command.equalsIgnoreCase('gamblesetwinningrange')) {
            if (action === undefined || isNaN(parseInt(action)) || action.includes('-') || action < 1 || action > 100) {
                $.say($.whisperPrefix(sender) + $.lang.get('gambling.win.range.usage'));
                return;
            }
            winRange = action;
            $.inidb.set('gambling', 'winRange', winRange);
            $.say($.whisperPrefix(sender) + $.lang.get('gambling.win.range', parseInt(winRange) + 1, winRange));
        }

        /**
         * @commandpath gamblesetgainpercent [amount in percent] - Set the winning gain percent.
         */
        if (command.equalsIgnoreCase('gamblesetgainpercent')) {
            if (action === undefined || isNaN(parseInt(action)) || action < 1 || action > 100) {
                $.say($.whisperPrefix(sender) + $.lang.get('gambling.percent.usage'));
                return;
            }
            winGainPercent = action;
            $.inidb.set('gambling', 'winGainPercent', winGainPercent);
            $.say($.whisperPrefix(sender) + $.lang.get('gambling.percent', winGainPercent));
        }
    });

    $.bind('initReady', function() {
        $.registerChatCommand('./custom/gambling.js', 'gamble', $.PERMISSION.Viewer);
        $.registerChatCommand('./custom/gambling.js', 'jackpot', $.PERMISSION.Viewer);
        $.registerChatCommand('./custom/gambling.js', 'gamblesetmax', $.PERMISSION.Admin);
        $.registerChatCommand('./custom/gambling.js', 'gamblesetmin', $.PERMISSION.Admin);
        $.registerChatCommand('./custom/gambling.js', 'gamblesetwinningrange', $.PERMISSION.Admin);
        $.registerChatCommand('./custom/gambling.js', 'gamblesetjackpotspot', $.PERMISSION.Admin);
        $.registerChatCommand('./custom/gambling.js', 'gamblesetjackpotdefault', $.PERMISSION.Admin);
        $.registerChatCommand('./custom/gambling.js', 'gamblesetgainpercent', $.PERMISSION.Admin);
    });

    
})();
