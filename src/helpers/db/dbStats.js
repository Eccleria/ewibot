//#region enums

/**
 * @enum {number} return values for most db helper functions
 */
export const dbReturnType = Object.freeze({
  isNotOk: -1,
  isOk: 0,
  isIn: 1,
  isNotIn: 2,
});

/**
 * @enum {string} user's stats attibutes
 */
export const statsKeys = Object.freeze({
  gifs: "gifs",
  hello: "hello",
  hungry: "hungry",
  emojis: "emojis",
  rolling: "rolling",
});

/**
 * Simplify userStatsInit with this global const
 */
const userStatsInit = Object.values(statsKeys).reduce((acc, val) => {
  if (val === statsKeys.emojis) return { ...acc, [val]: {} };
  return { ...acc, [val]: 0 };
}, {});

//#endregion

//#region use command

/**
 * Check if the user is in "accepting stats" user list
 * @param {object} db Database object
 * @param {string} userId User id to verify
 * @returns {dbReturnType} isIn if is in database, isNotIn otherwise
 */
const isStatsUser = (db, userId) => {
  const userIds = db.data.stats.map((obj) => obj.userId);
  if (userIds.includes(userId)) return dbReturnType.isIn;
  else return dbReturnType.isNotIn;
};

/**
 * Add user id to "accepting stats" user list
 * @param {object} db Database object
 * @param {string} userId User id to add
 * @returns {dbReturnType} isOk if is ok, isIn if user is in db
 */
const addStatsUser = (db, userId) => {
  const data = db.data.stats;
  if (isStatsUser(db, userId) === dbReturnType.isIn) return dbReturnType.isIn;
  else {
    db.data.stats = [...data, { userId, ...userStatsInit }];
    db.wasUpdated = true;
    return dbReturnType.isOk;
  }
};

/**
 * Remove user id from "accepting stats" user list
 * @param {object} db Database object
 * @param {string} userId User id to remove
 * @returns {dbReturnType} isOk if is ok, isNotIn if user is not in db
 */
const removeStatsUser = (db, userId) => {
  if (!isStatsUser(db, userId)) return dbReturnType.isNotIn;
  else {
    db.data.stats = db.data.stats.filter((obj) => obj.userId !== userId);
    db.wasUpdated = true;
    return dbReturnType.isOk;
  }
};

export { isStatsUser, addStatsUser, removeStatsUser };

//#endregion

//#region user stats

/**
 * Add +1 to corresponding stat and user
 * @param {object} db Database object
 * @param {string} userId User id which require stat change
 * @param {statsKeys} whichStat Which stat to add value
 * @param {?number} value The number to add to stat. 1 by default
 * @returns {dbReturnType} isOk if is ok, isNotIn if user isn't stats user
 */
const addStatsData = (db, userId, whichStat, value = 1) => {
  const data = db.data.stats;
  //check if is in db
  if (isStatsUser(db, userId) === dbReturnType.isIn) {
    for (const obj of data) {
      if (obj.userId === userId) {
        if (obj[whichStat] !== undefined) obj[whichStat] += value;
        else obj[whichStat] = 1;

        db.wasUpdated = true;
        return dbReturnType.isOk; //stop loop here, job is done
      }
    }
    return dbReturnType.isNotOk; //should not happen but anyway
  } else return dbReturnType.isNotIn;
};

/**
 * Add +1 to corresponding emoji and user
 * @param {object} db Database object
 * @param {string} userId User id which require stat change
 * @param {statsKeys} emojiId Emoji Id to add value
 * @param {?number} value The number to add to stat. 1 by default
 * @returns {dbReturnType} isOk if is ok, isNotIn if user isn't stats user
 */
const addEmojiData = (db, userId, emojiId, value = 1) => {
  const data = db.data.stats;
  //check if is in db
  if (isStatsUser(db, userId) === dbReturnType.isIn) {
    for (const obj of data) {
      if (obj.userId === userId) {
        const emojis = obj.emojis;
        if (emojis[emojiId] !== undefined) emojis[emojiId] += value;
        else emojis[emojiId] = 1;

        db.wasUpdated = true;
        return dbReturnType.isOk; //stop loop here, job is done
      }
    }
    return dbReturnType.isNotOk; //should not happen but anyway
  } else return dbReturnType.isNotIn;
};

export { addStatsData, addEmojiData };

//#endregion

//#region server stats

/**
 * Check if emoji is server counted or not
 * @param {object} db Database object
 * @param {string} emojiID emoji string id
 * @returns {dbReturnType} `isIn` if emoji is counted, `isNotIn` otherwise
 */
const isEmojiCounted = (db, emojiID) => {
  const data = db.data.serverStats.emojis;
  if (data[emojiID] !== undefined) return dbReturnType.isIn;
  else return dbReturnType.isNotIn;
};

/**
 * Add emoji count to server stats
 * @param {object} db Database object
 * @param {string} emojiID
 * @returns {dbReturnType} isOk if is ok, isNotOk else
 */
export const addServerEmojiCount = (db, emojiID) => {
  if (!db || !emojiID) return dbReturnType.isNotOk;

  db.wasUpdated = true;
  const data = db.data.serverStats.emojis;

  if (isEmojiCounted(db, emojiID) === dbReturnType.isIn) data[emojiID] += 1;
  else {
    console.log(`Add ${emojiID} in serverStats`);
    data[emojiID] = 1;
  }
  return dbReturnType.isOk;
};

/**
 * Add +1 to requested server stat value in db
 * @param {object} db Database object
 * @param {*} whichStat Which stat to add +1
 * @returns {dbReturnType} `isNotOk` if any input issue, `isOk` if no issue
 */
export const addServerStatsData = (db, whichStat) => {
  if (!db || !whichStat) return dbReturnType.isNotOk;

  const data = db.data.serverStats;

  if (data[whichStat] !== undefined) data[whichStat] += 1;
  else data[whichStat] = 1;

  db.wasUpdated = true;
  return dbReturnType.isOk;
};

//#endregion
