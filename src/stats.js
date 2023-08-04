import { gifRecovery } from "./admin/utils.js";
import { addStatsData } from "./helpers/index.js";

/**
 * Count gifs from message content and add it to user's stats
 * @param {object} message Message object
 */
export const statsGifCount = (message) => {
  const { content, author } = message;

  const gifs = gifRecovery(content);
  if (gifs) addStatsData(message.client.db, author.id, "gifs", gifs.length);
};
