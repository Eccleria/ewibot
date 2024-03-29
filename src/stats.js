import { addServerEmojiCount } from "./helpers/db/dbStats.js";
import { gifRecovery, parseEmoji, statsKeys } from "./helpers/index.js";
import { addStatsData, addEmojiData } from "./helpers/index.js";

/**
 * Count gifs from message content and add it to user's stats
 * @param {object} message Message object
 */
export const statsGifCount = (message) => {
  const { content, author, client } = message;

  const gifs = gifRecovery(content);
  if (gifs) addStatsData(client.db, author.id, statsKeys.gifs, gifs.length);
};

/**
 * Iterate over message content to find emojis and add them to db
 * @param {object} message Message object
 */
export const emojiInContentHandler = (message) => {
  const { author, client, content } = message;
  if (content.includes("<")) {
    //if no <, is not a guild emoji
    const splited = content.split(" ");
    for (const word of splited) {
      const emojiId = parseEmoji(word);

      //check if there is any emoji, and if this is a server emoji
      const test = emojiId ? isServerEmoji(message, emojiId) : emojiId;
      if (test) {
        addEmojiData(client.db, author.id, emojiId);
        addServerEmojiCount(client.db, emojiId);
      }
    }
  }
};

/**
 * Check if emoji is in the server of the message
 * @param {object} message Message with emoji or reaction to check
 * @param {string} emojiId Emoji id to check
 * @returns {boolean}
 */
const isServerEmoji = (message, emojiId) => {
  const { guild } = message;

  const guildEmojiManager = guild.emojis;
  return guildEmojiManager.cache.hasAll(emojiId);
};
