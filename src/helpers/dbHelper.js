const addIgnoredUser = async (authorId, db) => {
  if (!db.data.ignoredUsersIds.includes(authorId)) {
    db.data.ignoredUsersIds.push(authorId);
    //db.data.ignoredUsersIds = [...db.data.ignoredUsersIds, authorId];
    await db.write();
  }
};

const removeIgnoredUser = async (authorId, db) => {
  if (db.data.ignoredUsersIds.includes(authorId)) {
    db.data.ignoredUsersIds = db.data.ignoredUsersIds.filter(id => id !== authorId);
    await db.write();
  }
};

const getIgnoredUsers = (db) => {
  return db.data.ignoredUsersIds;
};

export { addIgnoredUser, removeIgnoredUser, getIgnoredUsers };