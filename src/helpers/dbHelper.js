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

const addBirthday = async (authorId, db, birthday) => {
  if (!isUserBirthday(authorId, db)) {
    db.data.birthdayUsers = [
      ...db.data.birthdayUsers,
      { userId: authorId, userBirthday: birthday },
    ];
    await db.write();
  }
};

const removeBirthday = async (authorId, db) => {
  if (isUserBirthday(authorId, db)) {
    db.data.birthdayUsers = db.data.birthdayUsers.filter(
      ({ userId }) => userId !== authorId
    );
    await db.write();
  }
};

const isUserBirthday = (authorId, db) => {
  return db.data.birthdayUsers
    .map((obj) => {
      return obj.userId;
    })
    .includes(authorId);
};

const getBirthday = (db) => {
  return db.data.birthdayUsers;
};

export { addBirthday, removeBirthday, isUserBirthday, getBirthday };
