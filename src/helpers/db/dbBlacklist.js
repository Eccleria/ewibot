const addBlacklist = (db, userId) => {
    var found = db.data.blacklistUsers.includes(userId);
    if (!found){
        db.data.blacklistUsers.push(userId);
        db.wasUpdated = true;
    }
    return !found;
}

const removeBlacklist = (db, userId) => {
    const found = db.data.blacklistUsers.includes(userId);
    if (found) {
        db.data.blacklistUsers = db.data.blacklistUsers.filter(
            item => item !== userId);
        db.wasUpdated = true;
    }
    return found;
}

const getBlacklist = (db) => {
    return db.data.blacklistUsers;
}

const isBlacklistedUser = (db, userId) => {
    return db.data.blacklistUsers.includes(userId);
}

export { addBlacklist, getBlacklist, removeBlacklist, isBlacklistedUser };