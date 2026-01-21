import { removeBirthday, removeIgnoredUser } from "../helpers/index.js";
import { COMMONS } from "../commons.js";

/**
 * Check if the event comes from test server
 * @param {object} eventObject eventObject given to listener from API
 * @returns {boolean} True if is test server
 */
export const isTestServer = (eventObject) => {
  const testServer = COMMONS.getTest();
  const test = testServer.guildId === eventObject.guild.id;
  return test; //if test, return true
};

export const removeUserFromDB = (userId, client) => {
  //check if user is in db for removal
  const db = client.db;
  removeBirthday(db, userId);
  removeIgnoredUser(db, userId);
};
