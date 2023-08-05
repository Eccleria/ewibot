//#region stats users

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
  reactions: "reactions",
  rolling: "rolling"
})

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
    db.data.stats = [
      ...data,
        Object.fromEntries(
        [
          ["userId", userId],
          ...Object.entries(statsKeys).map(([, val]) => [val, 0])
        ]
      )
    ];
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

//#region stats

/**
 * Add +1 to corresponding stat and user
 * @param {object} db Database object
 * @param {string} userId User id which require stat change
 * @param {statsKeys} whichStat Which stat to add +1
 * @param {?number} value The number to add to stat. 1 by default
 * @returns {dbReturnType} isOk if is ok, isNotIn if user isn't stats user
 */
const addStatsData = (db, userId, whichStat, value = 1) => {
  const data = db.data.stats;
  //check if is in db
  if (isStatsUser(db, userId)) {
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

export { addStatsData };

//#endregion
