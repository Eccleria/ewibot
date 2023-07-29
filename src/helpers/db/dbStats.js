//#region stats users

/**
 * @enum {number} return values for most db helper functions
 */
const dbReturnType = Object.freeze({
    isNotOk: -1,
    isOk: 0,
    isIn: 1,
    isNotIn: 2
});

/**
 * Check if the user is in "accepting stats" user list
 * @param {*} db Database object
 * @param {string} userId User id to verify
 * @returns {dbReturnType} isIn if is in database, isNotIn otherwise
 */
const isStatsUser = (db, userId) => {
    if(db.data.stats.users.includes(userId))
        return dbReturnType.isIn;
    else return dbReturnType.isNotIn;
}

/**
 * Add user id to "accepting stats" user list
 * @param {*} db Database object
 * @param {*} userId User id to add
 * @returns {dbReturnType} isOk if is ok, isIn if user is in db
 */
const addStatsUser = (db, userId) => {
    const data = db.data.stats.users;
    if (isStatsUser(db, userId)) return dbReturnType.isIn;
    else {
        db.data.stats.users = [...data, userId];
        db.wasUpdated = true;
        return dbReturnType.isOk;
    }
}

/**
 * Remove user id from "accepting stats" user list
 * @param {*} db Database object
 * @param {*} userId User id to remove
 * @returns {dbReturnType} isOk if is ok, isNotIn if user is not in db
 */
const removeStatsUser = (db, userId) => {
    if (!isStatsUser(db, userId)) return dbReturnType.isNotIn;
    else {
        db.data.stats.users = db.data.stats.users.filter((id) => id !== userId)
        db.wasUpdated = true;
        return dbReturnType.isOk;
    }
}

export { isStatsUser, addStatsUser, removeStatsUser };
