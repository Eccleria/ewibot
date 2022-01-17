const addIgnoredUser = async (authorId, db) => {
  console.log(db.data);

  if (!db.data.ignoredUsersIds.includes(authorId)) {
    db.data.ignoredUsersIds.push(authorId);
    //db.data.ignoredUsersIds = [...db.data.ignoredUsersIds, authorId];
    await db.write();
  }
};

const removeIgnoredUser = async (authorId, db) => {
  console.log(db.data);
  if (db.data.ignoredUsersIds.includes(authorId)) {
    db.data.ignoredUsersIds = db.data.ignoredUsersIds.filter(
      (id) => id !== authorId
    );
    await db.write();
  }
};

const getIgnoredUsers = (db) => {
  console.log(db);
  return db.data.ignoredUsersIds;
};

export { addIgnoredUser, removeIgnoredUser, getIgnoredUsers };
