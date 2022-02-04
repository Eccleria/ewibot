// IGNORED USERS
const addIgnoredUser = (authorId, db) => {
  if (!db.data.ignoredUsersIds.includes(authorId)) {
    db.data.ignoredUsersIds.push(authorId);
  }
  db.wasUpdated = true;
};

const removeIgnoredUser = (authorId, db) => {
  if (db.data.ignoredUsersIds.includes(authorId)) {
    db.data.ignoredUsersIds = db.data.ignoredUsersIds.filter(
      (id) => id !== authorId
    );
  }
  db.wasUpdated = true;
};

const isUserIgnored = (authorId, db) => {
  return db.data.ignoredUsersIds.includes(authorId);
};

const getIgnoredUsers = (db) => {
  return db.data.ignoredUsersIds;
};

export { addIgnoredUser, removeIgnoredUser, getIgnoredUsers, isUserIgnored };

// BIRTHDAY
const getBirthday = (db) => {
  return db.data.birthdays;
};

const isUserBirthday = (authorId, db) => {
  return getBirthday(db)
    .birthdayUsers.map((obj) => {
      return obj.userId;
    })
    .includes(authorId);
};

const addBirthday = (authorId, db, birthday) => {
  if (!isUserBirthday(authorId, db)) {
    db.data.birthdays.birthdayUsers = [
      ...db.data.birthdays.birthdayUsers,
      { userId: authorId, userBirthday: birthday },
    ];
    db.wasUpdated = true;
  }
};

const removeBirthday = (authorId, db) => {
  if (isUserBirthday(authorId, db)) {
    db.data.birthdays.birthdayUsers = db.data.birthdays.birthdayUsers.filter(
      ({ userId }) => userId !== authorId
    );
    db.wasUpdated = true;
  }
};

export { addBirthday, removeBirthday, isUserBirthday, getBirthday };

// APOLOGY COUNTING
const getApologyUsers = (db) => {
  return db.data.apologiesCounting;
};

const isApologyUser = (authorId, db) => {
  return getApologyUsers(db)
    .map((obj) => {
      return obj.userId;
    })
    .includes(authorId);
};

const addApologyCount = (authorId, db) => {
  const { apologiesCounting } = db.data;

  if (isApologyUser(authorId, db)) {
    for (const obj of apologiesCounting) {
      if (obj.userId === authorId) {
        obj.counter++;
      }
    }
  } else {
    db.data.apologiesCounting = [
      ...db.data.apologiesCounting,
      { userId: authorId, counter: 1 },
    ];
  }
  db.wasUpdated = true;
};

const resetApologyCount = (db) => {
  db.data.apologiesCounting = [];
  db.wasUpdated = true;
};

export { getApologyUsers, isApologyUser, addApologyCount, resetApologyCount };

//IGNORE CHANNEL
const isIgnoredChannel = (db, channelId) => {
  return db.data.ignoredChannelIds.includes(channelId);
};

const addIgnoredChannel = (db, channelId) => {
  if (!isIgnoredChannel(db, channelId)) {
    db.data.ignoredChannelIds.push(channelId);
  }
  db.wasUpdated = true;
};

const removeIgnoredChannel = (db, channelId) => {
  if (isIgnoredChannel(db, channelId)) {
    db.data.ignoredChannelIds = db.data.ignoredChannelIds.filter(
      (id) => id !== channelId
    );
  }
  db.wasUpdated = true;
};

export { isIgnoredChannel, addIgnoredChannel, removeIgnoredChannel };
