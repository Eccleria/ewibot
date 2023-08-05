import { gifRecovery } from "./admin/utils.js";
import { statsKeys } from "./helpers/db/dbStats.js";
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
