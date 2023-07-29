//#region stats users

/**
 * @enum {number} return values for most db helper functions
 */
export const dbReturnType = Object.freeze({
    isNotOk: -1,
    isOk: 0,
    isIn: 1,
    isNotIn: 2
});

/**
 * Check if the user is in "accepting stats" user list
 * @param {object} db Database object
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
 * @param {object} db Database object
 * @param {string} userId User id to add
 * @returns {dbReturnType} isOk if is ok, isIn if user is in db
 */
const addStatsUser = (db, userId) => {
    const data = db.data.stats;
    if (data.stats.map((obj) => obj.userId).includes(userId)) return dbReturnType.isIn;
    else {
        db.data.stats.users = [...data.users, userId];
        db.data.stats.stats = [...data.stats, {
            "userId": userId, 
            "gifs": 0,
            "hello": 0,
            "hungry": 0,
            "reactions": 0,
            "rolling": 0
        }]
        db.wasUpdated = true;
        return dbReturnType.isOk;
    }
}

/**
 * Remove user id from "accepting stats" user list
 * @param {object} db Database object
 * @param {string} userId User id to remove
 * @returns {dbReturnType} isOk if is ok, isNotIn if user is not in db
 */
const removeStatsUser = (db, userId) => {
    if (!isStatsUser(db, userId)) return dbReturnType.isNotIn;
    else {
        db.data.stats.users = db.data.stats.users.filter((id) => id !== userId);
        db.data.stats.stats = db.data.stats.stats.filter((obj) => obj.userId !== userId);
        db.wasUpdated = true;
        return dbReturnType.isOk;
    }
}

export { isStatsUser, addStatsUser, removeStatsUser };

//#endregion

//#region stats

/**
 * Add +1 to corresponding stat and user
 * @param {object} db Database object
 * @param {string} userId User id which require stat change
 * @param {string} whichStat Which stat to add +1
 * @returns {dbReturnType} isOk if is ok
 */
const addStatsData = (db, userId, whichStat) => {
    const data = db.data.stats;
    //check if is in db
    if (isStatsUser(db, userId)) {
        for (const obj of data.stats) {
            if (obj.userId === userId) {
                if(obj[whichStat] !== undefined) obj[whichStat]++;
                else obj[whichStat] = 1;
                db.wasUpdated = true;
                return dbReturnType.isOk;
            } 
        }
        {
            //pass
            //is in stats.user but not in stats.whichStat => add again and recursive
            /*
            removeStatsUser(db, userId);
            addStatsUser(db, userId);
            //refreshStatUser(db, userId);
            if(addStatData(db, userId, whichStat) !== dbReturnType.isOk) 
            return dbReturnType.isNotOk;
            */
        }
    } else return dbReturnType.isNotIn;
}

export { addStatsData };

//#endregion
