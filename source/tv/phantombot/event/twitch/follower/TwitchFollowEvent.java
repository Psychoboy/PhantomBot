/*
 * Copyright (C) 2016-2023 phantombot.github.io/PhantomBot
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
package tv.phantombot.event.twitch.follower;

public class TwitchFollowEvent extends TwitchFollowerEvent {
    private final boolean silent;

    /**
     * Class constructor.
     *
     * @param follower
     * @param date
     */
    public TwitchFollowEvent(String follower, String date) {
        this(follower, date, false);
    }

    /**
     * Class constructor.
     *
     * @param follower
     * @param date
     * @param silent
     */
    public TwitchFollowEvent(String follower, String date, boolean silent) {
        super(follower, date);
        this.silent = silent;
    }

    public boolean silent() {
        return this.silent;
    }
}
