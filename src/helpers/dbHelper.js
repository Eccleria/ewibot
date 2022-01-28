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

const addBirthday = async (message, db) => {
  const words = message.content.toLowerCase().split(" ");
  const birthday = words[1];
  if (!isUserBirthday(message, db)) {
    db.data.birthdayUsers = [...db.data.birthdayUsers, { "userId": message.author.id, "userBirthday": birthday}];
    await db.write();
  }
};

const removeBirthday = async (message, db) => {
  if (isUserBirthday(message, db)) {
    db.data.birthdayUsers = db.data.birthdayUsers.filter(
      ({ userId }) => userId !== message.author.id
    );
    await db.write();
  }
};

const isUserBirthday = (message, db) => {
  return db.data.birthdayUsers.map(obj => {return obj.userId}).includes(message.author.id)
};

const getBirthday = (db) => {
  return db.data.birthdayUsers;
};

export { addBirthday, removeBirthday, isUserBirthday, getBirthday };