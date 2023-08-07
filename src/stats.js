import { gifRecovery } from "./admin/utils.js";
import { addServerEmojiCount } from "./helpers/db/dbStats.js";
import { parseEmoji, statsKeys } from "./helpers/index.js";
import { addStatsData } from "./helpers/index.js";

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
 * @param {string} message Message
 */
export const emojiInContentHandler = (message) => {
  const { author, client, content } = message;
  if (content.includes("<")) {
    //if no <, is not a guild emoji
    const splited = content.split(" ");
    for (const word of splited) {
      const emojiId = parseEmoji(word);
      if (emojiId) {
        addStatsData(client.db, author.id, statsKeys.reactions);
        addServerEmojiCount(client.db, emojiId);
      }
    }
  }
}
