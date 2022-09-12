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
package com.gmt2001.twitch.tmi;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * An IRCv3 formatted message from TMI
 *
 * @author gmt2001
 */
public final class TMIMessage {

    /**
     * The type of message
     */
    public enum TMIMessageType {
        /**
         * The connection has been opened and is ready to join a channel
         */
        OPEN,
        /**
         * A TMI message in IRCv3 format
         */
        MESSAGE,
        /**
         * The connection is closing
         */
        CLOSE
    }

    private final TMIMessageType messageType;
    private final Map<String, String> tags;
    private final Map<String, String> badges;
    private final Map<String, List<EmoteLocation>> emotes;
    private final List<String> emoteSets;
    private final String nick;
    private final String host;
    private final String command;
    private final String channel;
    private final String parameters;

    TMIMessage(TMIMessageType messageType, String message) {
        String[] messageParts = this.parseMessage(message);
        this.messageType = messageType;
        this.tags = Collections.unmodifiableMap(this.parseTags(messageParts[0]));
        this.badges = Collections.unmodifiableMap(this.parseBadges(this.tags.getOrDefault("badges", ""), this.tags.getOrDefault("badge-info", "")));
        this.emotes = Collections.unmodifiableMap(this.parseEmotes(this.tags.getOrDefault("emotes", "")));
        this.emoteSets = Collections.unmodifiableList(this.parseEmoteSets(this.tags.getOrDefault("emote-sets", "")));
        this.nick = messageParts[1];
        this.host = messageParts[2];
        this.command = messageParts[3];
        this.channel = messageParts[4];
        this.parameters = messageParts[5];
    }

    TMIMessage(TMIMessageType messageType) {
        this.messageType = messageType;
        this.tags = null;
        this.badges = null;
        this.emotes = null;
        this.emoteSets = null;
        this.nick = null;
        this.host = null;
        this.command = null;
        this.channel = null;
        this.parameters = null;
    }

    // https://dev.twitch.tv/docs/irc/example-parser
    private String[] parseMessage(String message) {
        int idx = 0;
        int endIdx;
        String rawTagsComponent = null;
        String rawSourceComponent = null;
        String rawCommandComponent;
        String rawParametersComponent = null;

        if (message.charAt(idx) == '@') {
            idx++;
            endIdx = message.indexOf(' ', idx);
            rawTagsComponent = message.substring(idx, endIdx);
            idx = endIdx + 1;
        }

        if (message.charAt(idx) == ':') {
            idx++;
            endIdx = message.indexOf(' ', idx);
            rawSourceComponent = message.substring(idx, endIdx);
            idx = endIdx + 1;
        }

        endIdx = message.indexOf(':', idx);
        if (endIdx == -1) {
            endIdx = message.length();
        }

        rawCommandComponent = message.substring(idx, endIdx).trim();

        if (endIdx != message.length()) {
            idx = endIdx + 1;
            rawParametersComponent = message.substring(idx);
        }

        String rnick = null;
        String rhost = null;
        if (rawSourceComponent != null) {
            String[] sourceParts = rawSourceComponent.split("!");
            rnick = sourceParts.length == 2 ? sourceParts[0] : null;
            rhost = sourceParts.length == 2 ? sourceParts[1] : sourceParts[0];
        }

        String rcommand;
        String rchannel = null;
        if (rawCommandComponent.contains(" ")) {
            String[] commandParts = rawCommandComponent.split(" ");
            rcommand = commandParts[0];
            rchannel = commandParts[1];

            if (rcommand.equals("CAP")) {
                rcommand += " " + commandParts[2];
            }
        } else {
            rcommand = rawCommandComponent;
        }

        return new String[]{rawTagsComponent, rnick, rhost, rcommand, rchannel, rawParametersComponent};
    }

    private Map<String, String> parseTags(String sTags) {
        Map<String, String> rtags = new HashMap<>();
        String[] tagParts = sTags.split(";");

        for (String tagPart : tagParts) {
            String[] tagSpl = tagPart.split("=");
            rtags.putIfAbsent(tagSpl[0], tagSpl.length > 1 ? tagSpl[1] : "");

            if (tagSpl[0].equals("badges")) {
                Map<String, String> rbadges = parseLegacyBadges(tagSpl[1]);

                for (Map.Entry<String, String> badge : rbadges.entrySet()) {
                    rtags.putIfAbsent(badge.getKey(), badge.getValue());
                }
            }
        }

        return rtags;
    }

    private Map<String, String> parseBadges(String rawBadges, String rawBadgeInfo) {
        Map<String, String> rbadges = new HashMap<>();

        String[] badgeParts = rawBadges.split(",");

        for (String badgePart : badgeParts) {
            String[] badge = badgePart.split("/");
            rbadges.putIfAbsent(badge[0], badge[1]);
        }

        badgeParts = rawBadgeInfo.split(",");

        for (String badgePart : badgeParts) {
            String[] badge = badgePart.split("/");
            rbadges.putIfAbsent(badge[0], badge[1]);
        }

        return rbadges;
    }

    private Map<String, List<EmoteLocation>> parseEmotes(String rawEmotes) {
        Map<String, List<EmoteLocation>> remotes = new HashMap<>();

        String[] emotesParts = rawEmotes.split("/");

        for (String emote : emotesParts) {
            String[] emoteParts = emote.split(":");
            List<EmoteLocation> emoteLocations = new ArrayList<>();
            String[] positions = emoteParts[1].split(",");

            for (String position : positions) {
                String[] positionParts = position.split("-");
                emoteLocations.add(new EmoteLocation(positionParts[0], positionParts[1]));
            }

            remotes.putIfAbsent(emoteParts[0], Collections.unmodifiableList(emoteLocations));
        }

        return remotes;
    }

    private List<String> parseEmoteSets(String rawEmoteSets) {
        return Arrays.asList(rawEmoteSets.split(","));
    }

    private Map<String, String> parseLegacyBadges(String rawBadges) {
        Map<String, String> rbadges = new HashMap<>();

        // Add default values.
        rbadges.put("user-type", "");
        rbadges.put("subscriber", "0");
        rbadges.put("turbo", "0");
        rbadges.put("premium", "0");
        rbadges.put("vip", "0");

        if (rawBadges.length() > 0) {
            String badgeParts[] = rawBadges.split(",");

            for (String badge : badgeParts) {
                badge = badge.substring(0, badge.indexOf('/'));

                switch (badge) {
                    case "staff":
                    case "global_mod":
                    case "admin":
                    case "broadcaster":
                    case "moderator":
                        rbadges.put("user-type", badge);
                        break;
                    case "subscriber":
                    case "founder":
                        rbadges.put("subscriber", "1");
                        break;
                    case "turbo":
                        rbadges.put("turbo", "1");
                        break;
                    case "premium":
                        rbadges.put("premium", "1");
                        break;
                    case "vip":
                        rbadges.put("vip", "1");
                        break;
                    default:
                        break;
                }
            }
        }

        return rbadges;
    }

    /**
     * @return The message type
     */
    public TMIMessageType messageType() {
        return this.messageType;
    }

    /**
     * @return The IRCv3 tags
     */
    public Map<String, String> tags() {
        return this.tags;
    }

    /**
     * @return The badges and badge-info components of the IRCv3 tags
     */
    public Map<String, String> badges() {
        return this.badges;
    }

    /**
     * @return The emotes component of the IRCv3 tags, parsed into emoteId: List<{@link EmoteLocation}> pairs
     */
    public Map<String, List<EmoteLocation>> emotes() {
        return this.emotes;
    }

    /**
     * @return The emote-sets component of the IRCv3 tags
     */
    public List<String> emoteSets() {
        return this.emoteSets;
    }

    /**
     * @return The nick that sent the message, if present
     */
    public String nick() {
        return this.nick;
    }

    /**
     * @return The host that sent the message, if present
     */
    public String host() {
        return this.host;
    }

    /**
     * @return The IRC command received
     */
    public String command() {
        return this.command;
    }

    /**
     * @return The channel the command was received in, if present
     */
    public String channel() {
        return this.channel;
    }

    /**
     * @return The parameters of the command, if present
     */
    public String parameters() {
        return this.parameters;
    }

    /**
     * The index of an emote in the parameters
     */
    public final class EmoteLocation {

        private final int start;
        private final int end;

        EmoteLocation(String start, String end) {
            this.start = Integer.parseInt(start);
            this.end = Integer.parseInt(end);
        }

        /**
         * @return The start index for the emote text, for substring functions
         */
        public int start() {
            return this.start;
        }

        /**
         * @return The end index for the emote text, for substring functions. Note that this is the index of the char, not the length
         */
        public int end() {
            return this.end;
        }

        /**
         * @return The length of the emote text
         */
        public int length() {
            return (this.end - this.start) + 1;
        }
    }
}
