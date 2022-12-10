(function() {
    baseFileOutputPath ='./addons/'
    function getCount(counterName, alertStr) {
        var total = $.getSetIniDbString('multicounter', counterName, '0');
        sendAlert(total, alertStr);
        return total;
    }

    function resetCount(counterName, alertStr) {
        $.inidb.set('multicounter', counterName, 0);
        writeFile(counterName, '0')
        return '0';
    }

    function addCount(counterName, alertStr) {
        $.inidb.incr('multicounter', counterName, 1);
        return getAndWriteCount(counterName, alertStr)
    }

    function removeCount(counterName, alertStr) {
        $.inidb.decr('multicounter', counterName, 1);
        return getAndWriteCount(counterName, alertStr);
    }

    function setCount(counterName, amount, alertStr) {
        $.inidb.set('multicounter', counterName, parseInt(amount));
        return getAndWriteCount(counterName, alertStr);
    }

    function getAndWriteCount(counterName, alertStr) {
        count = getCount(counterName, alertStr);
        writeFile(counterName, count);
        return count
    }

    function sendAlert(total, alertStr) {
        alertStr = $.replace(alertStr, '(totalcount)', total);
        $.alertspollssocket.alertImage(alertStr);
    }

    function writeFile(counterName, amount) {
        writeAmountOnly(counterName, amount);
        writeWithName(counterName, amount);
    }

    function writeAmountOnly(counterName, amount) {
        var writer = new java.io.OutputStreamWriter(new java.io.FileOutputStream(baseFileOutputPath + counterName + '.txt'), 'UTF-8');
        try {
            writer.write(amount);
        } catch (ex) {
            $.log.error('Failed to write counter file: ' + ex.toString());
        } finally {
            writer.close();
        }
    }

    function writeWithName(counterName, amount) {
        var writer = new java.io.OutputStreamWriter(new java.io.FileOutputStream(baseFileOutputPath + counterName + '-full.txt'), 'UTF-8');
        try {
            writer.write(counterName + ": " + amount);
        } catch (ex) {
            $.log.error('Failed to write counter file: ' + ex.toString());
        } finally {
            writer.close();
        }
    }


    function multicounter(args) {

        var sender = args.event.getSender().toLowerCase(),
            eventArgs = args.event.getArgs(),
            action = eventArgs[0],
            actionArg1 = eventArgs[1];

        if ((match = args.args.match(/^\s(\S+)(?:\s(.*))?$/))) {
            counterName = match[1];
            alertStr = match[2] || '';
        } else {
            return {
                result: '',
                cache: false
            }
        }

        if(!action) {
            return {
                result: getCount(counterName, alertStr),
                cache: false
            }
        }
        if ($.isMod(sender) || $.isSub(sender) || $.isVIP(sender)) {
            if(action == "+") {
                return {
                    result: addCount(counterName, alertStr),
                    cache: false
                }
            }

            if(action == "-") {
                return {
                    result: removeCount(counterName, alertStr),
                    cache: false
                }
            }

            if(action == "reset") {
                return {
                    result: resetCount(counterName, alertStr),
                    cache: false
                }
            }

            if(action == "set") {
                return {
                    result: setCount(counterName, actionArg1, alertStr),
                    cache: false
                }
            }
            
            return {
                result: getCount(counterName, alertStr),
                cache: false
            }

        }

    }

    var transformers = [
        new $.transformers.transformer('multicounter', ['twitch', 'discord', 'noevent', 'alerts'], multicounter)
    ];
    $.transformers.addTransformers(transformers);
})();