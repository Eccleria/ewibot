const addIgnoredUser = async (authorId, db) => {
  if (!db.data.ignoredUsersIds.includes(authorId)) {
    db.data.ignoredUsersIds.push(authorId);
    //db.data.ignoredUsersIds = [...db.data.ignoredUsersIds, authorId];
    await db.write();
  }
};

const removeIgnoredUser = async (authorId, db) => {
  if (db.data.ignoredUsersIds.includes(authorId)) {
    db.data.ignoredUsersIds = db.data.ignoredUsersIds.filter(
      (id) => id !== authorId
    );
    await db.write();
  }
};

const isUserIgnored = async (authorId, db) => {
  return db.data.ignoredUsersIds.includes(authorId);
};

const getIgnoredUsers = (db) => {
  console.log(db);
  return db.data.ignoredUsersIds;
};

export { addIgnoredUser, removeIgnoredUser, getIgnoredUsers, isUserIgnored };

const addApologyUser = async (authorId, db) => {
  if (!isApologyUser(authorId, db)) {
    db.data.apologiesCounting.push({ userId: authorId, counter: 0 });
    await db.write();
  }
};

const getApologyUsers = (db) => {
  return db.data.apologiesCounting;
};

const isApologyUser = (authorId, db) => {
  return getApologyUsers(db).includes(({ userId }) => userId === authorId);
};

const addApologyCount = async (authorId, db) => {
  for (const obj of db.data.apologiesCounting)
    if (Object.values(obj)[0] === authorId) {
      obj.counter += 1;
      await db.write();
    }
};

const resetApologyCount = async (db) => {
  db.data.apologiesCounting.map((obj) => (obj.counter = 0));
  await db.write();
};
export {
  addApologyUser,
  getApologyUsers,
  isApologyUser,
  addApologyCount,
  resetApologyCount,
};
