import {
  removeBirthday,
  removeIgnoredUser,
} from "../helpers/index.js";
import { COMMONS } from "../commons.js";

export const fetchMessage = async (message) => {
  try {
    return await message.fetch();
  } catch (e) {
    console.log(e);
    return null;
  }
};

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

export const isSameEmojiInGuildUpdate = (a, b) => {
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.emoji_id === b.emoji_id &&
    a.emoji_name === b.emoji_name &&
    a.moderated === b.moderated
  );
};

export const onlyInLeft = (left, right, compareFunction) => {
  return left.filter(
    (leftValue) =>
      !right.some((rightValue) => compareFunction(leftValue, rightValue)),
  );
};
