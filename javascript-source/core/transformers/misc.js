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

(function () {
    var cmd, i, match;

    /*
     * @transformer code
     * @formula (code length:int) random code of the given length composed of a-zA-Z0-9
     * @labels twitch discord command misc
     * @example Caster: !addcom !code (code 5)
     * User: !code
     * Bot: A1D4f
     */
    function code(args) {
        var code,
                length,
                temp = '';
        if ((match = args.match(/^(?:=|\s)([1-9]\d*)$/))) {
            code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            length = parseInt(match[1]);
            for (i = 0; i < length; i++) {
                temp += code.charAt(Math.floor(Math.random() * code.length));
            }
            return {
                result: temp,
                cache: false
            };
        }
    }

    /*
     * @transformer encodeurl
     * @formula (encodeurl url:str) url encode the given url
     * @labels twitch discord command misc
     * @cached
     */
    function encodeurl(args) {
        if ((match = args.match(/^ (.*)$/))) {
            return {
                result: encodeURI(match[1]),
                cache: true
            };
        }
    }

    /*
     * @transformer encodeurlparam
     * @formula (encodeurlparam paramter:str) like encodeurl but also ecapes "&", "=", "+", "/", etc.
     * @labels twitch discord command misc
     * @cached
     */
    function encodeurlparam(args) {
        if ((match = args.match(/^ (.*)$/))) {
            return {
                result: encodeURIComponent(match[1]),
                cache: true
            };
        }
    }

    /*
     * @transformer keywordcount
     * @formula (keywordcount keyword:str) increase the keyword count for the given keyword and return new count
     * @labels twitch keyword misc
     */
    function keywordcount(args) {
        var keyword,
                keywordInfo;
        if ((match = args.match(/^\s(.+)$/))) {
            keyword = match[1];
            if ($.inidb.exists('keywords', keyword)) {
                keywordInfo = JSON.parse($.inidb.get('keywords', keyword));
                if ('count' in keywordInfo) {
                    ++keywordInfo["count"];
                } else {
                    keywordInfo["count"] = 1;
                }
                $.inidb.set('keywords', keyword, JSON.stringify(keywordInfo));
                return {result: keywordInfo["count"]};
            } else {
                return {result: $.lang.get('customcommands.keyword.404', keyword)};
            }
        }
    }

    /*
     * @transformer token
     * @formula (token) replaced with the secret token that was set by !tokencom or the panel
     * @labels twitch command misc
     * @example Caster: !addcom !weather (customapijson http://api.apixu.com/v1/current.json?key=(token)&q=$1 {Weather for} location.name {:} current.condition.text {Temps:} current.temp_f {F} current.temp_c {C})
     * Caster: !tokencom !weather mySecretApiKey
     * User: !weather 80314
     * // customapijson generates the below response using the url: http://api.apixu.com/v1/current.json?key=mySecretApiKey&q=80314
     * Bot: Weather for Boulder, CO : Sunny Temps: 75 F 24 C
     * @cached
     */
    function token(args, event) {
        cmd = event.getCommand();
        if ($.inidb.HasKey('commandtoken', '', cmd)) {
            return {
                result: $.inidb.GetString('commandtoken', '', cmd),
                cache: true
            };
        } else {
            return {
                result: 'NOT_SET',
                cache: true
            };
        }
    }

    /*
     * @transformer unescape
     * @formula (unescape str:str) unescape \\ \( \) to \ ( ) respectively
     * @labels twitch discord command misc
     * @raw
     * @cached
     */
    function unescape(args) {
        if ((match = args.match(/^ (.*)$/))) {
            return {
                result: match[1],
                raw: true,
                cache: true
            };
        }
    }

    var transformers = [
        new $.transformers.transformer('code', ['twitch', 'discord', 'command', 'misc'], code),
        new $.transformers.transformer('encodeurl', ['twitch', 'discord', 'command', 'misc'], encodeurl),
        new $.transformers.transformer('encodeurlparam', ['twitch', 'discord', 'command', 'misc'], encodeurlparam),
        new $.transformers.transformer('keywordcount', ['twitch', 'keyword', 'misc'], keywordcount),
        new $.transformers.transformer('token', ['twitch', 'command', 'misc'], token),
        new $.transformers.transformer('unescape', ['twitch', 'discord', 'command', 'misc'], unescape)
    ];

    $.transformers.addTransformers(transformers);
})();
