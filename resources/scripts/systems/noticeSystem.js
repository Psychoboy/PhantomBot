!function(){function e(){var e,i=$.inidb.GetKeyList("notices",""),n=0;for(e=0;e<i.length;e++)$.inidb.set("tempnotices",i[e],$.inidb.get("notices",i[e]));for($.inidb.RemoveFile("notices"),i=$.inidb.GetKeyList("tempnotices",""),e=0;e<i.length;e++)$.inidb.set("notices","message_"+n,$.inidb.get("tempnotices",i[e])),n++;$.inidb.RemoveFile("tempnotices")}function i(){var e=Packages.me.mast3rplan.phantombot.event.EventBus,i=Packages.me.mast3rplan.phantombot.event.command.CommandEvent,n=$.inidb.get("notices","message_"+g);g++,g>=o&&(g=0),n.startsWith("command:")?(n=n.substring(8),e.instance().postCommand(new i($.botName,n," "))):$.say(n)}var n=$.inidb.exists("noticeSettings","reqmessages")?parseInt($.inidb.get("noticeSettings","reqmessages")):25,t=$.inidb.exists("noticeSettings","interval")?parseInt($.inidb.get("noticeSettings","interval")):10,s=$.inidb.exists("noticeSettings","noticetoggle")?$.getIniDbBoolean("noticeSettings","noticetoggle"):!1,o=parseInt($.inidb.GetKeyList("notices","").length)?parseInt($.inidb.GetKeyList("notices","").length):0,a=$.inidb.exists("noticeSettings","noticeOffline")?$.getIniDbBoolean("noticeSettings","noticeOffline"):!0,r=0,g=0;$.bind("ircChannelMessage",function(){r++}),$.bind("command",function(i){var r=i.getSender(),g=i.getCommand(),c=i.getArguments().trim(),l=i.getArgs(),d=l[0];if(g.equalsIgnoreCase("notice")){if(!$.isAdmin(r))return void $.say($.whisperPrefix(r)+$.adminMsg);if(0==l.length)return void $.say($.whisperPrefix(r)+$.lang.get("noticehandler.notice-usage"));if(d.equalsIgnoreCase("get"))return l.length<2?void $.say($.whisperPrefix(r)+$.lang.get("noticehandler.notice-get-usage",o)):$.inidb.exists("notices","message_"+l[1])?void $.say($.inidb.get("notices","message_"+l[1])):void $.say($.whisperPrefix(r)+$.lang.get("noticehandler.notice-error-notice-404"));if(d.equalsIgnoreCase("edit"))return l.length<3?void $.say($.whisperPrefix(r)+$.lang.get("noticehandler.notice-edit-usage",o)):$.inidb.exists("notices","message_"+l[1])?(c=c.replace(d+"","").trim(),$.inidb.set("notices","message_"+l[1],c),void $.say($.whisperPrefix(r)+$.lang.get("noticehandler.notice-edit-success"))):void $.say($.whisperPrefix(r)+$.lang.get("noticehandler.notice-error-notice-404"));if(d.equalsIgnoreCase("remove"))return l.length<2?void $.say($.whisperPrefix(r)+$.lang.get("noticehandler.notice-remove-usage",o)):$.inidb.exists("notices","message_"+l[1])?($.inidb.del("notices","message_"+l[1]),o--,e(),void $.say($.whisperPrefix(r)+$.lang.get("noticehandler.notice-remove-success"))):void $.say($.whisperPrefix(r)+$.lang.get("noticehandler.notice-error-notice-404"));if(d.equalsIgnoreCase("add"))return l.length<2?void $.say($.whisperPrefix(r)+$.lang.get("noticehandler.notice-add-usage")):(c=c.replace(d+"","").trim(),$.inidb.set("notices","message_"+o,c),o++,void $.say($.whisperPrefix(r)+$.lang.get("noticehandler.notice-add-success")));if(d.equalsIgnoreCase("interval"))return l.length<2?void $.say($.whisperPrefix(r)+$.lang.get("noticehandler.notice-interval-usage")):parseInt(l[1])<2?void $.say($.whisperPrefix(r)+$.lang.get("noticehandler.notice-interval-404")):($.inidb.set("noticeSettings","interval",l[1]),t=parseInt(l[1]),void $.say($.whisperPrefix(r)+$.lang.get("noticehandler.notice-inteval-success")));if(d.equalsIgnoreCase("req"))return l.length<2?void $.say($.whisperPrefix(r)+$.lang.get("noticehandler.notice-req-usage")):parseInt(l[1])<1?void $.say($.whisperPrefix(r)+$.lang.get("noticehandler.notice-req-404")):($.inidb.set("noticeSettings","reqmessages",l[1]),n=parseInt(l[1]),void $.say($.whisperPrefix(r)+$.lang.get("noticehandler.notice-req-success")));if(d.equalsIgnoreCase("config"))return void $.say($.whisperPrefix(r)+$.lang.get("noticehandler.notice-config",s,t,n,o,a));d.equalsIgnoreCase("toggle")&&(s?(s=!1,$.inidb.set("noticeSettings","noticetoggle","false"),$.say($.whisperPrefix(r)+$.lang.get("noticehandler.notice-disabled"))):(s=!0,$.inidb.set("noticeSettings","noticetoggle","true"),$.say($.whisperPrefix(r)+$.lang.get("noticehandler.notice-enabled")))),d.equalsIgnoreCase("toggleoffline")&&(a?(a=!1,$.inidb.set("noticeSettings","noticeOffline","false"),$.say($.whisperPrefix(r)+$.lang.get("noticehandler.notice-disabled.offline"))):(a=!0,$.inidb.set("noticeSettings","noticeOffline","true"),$.say($.whisperPrefix(r)+$.lang.get("noticehandler.notice-enabled.offline"))))}}),setInterval(function(){if(s&&$.bot.isModuleEnabled("./systems/noticeSystem.js")&&o>0&&r>=n){if(!a&&!$.isOnline($.channelName))return;i(),r=0}},60*t*1e3),$.bind("initReady",function(){$.bot.isModuleEnabled("./systems/noticeSystem.js")&&$.registerChatCommand("./systems/noticeSystem.js","notice")})}();
