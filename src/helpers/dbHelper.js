
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

// APOLOGIES
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
export {
  getApologyUsers,
  isApologyUser,
  addApologyCount,
  resetApologyCount,
  addIgnoredUser,
  removeIgnoredUser,
  getIgnoredUsers,
  isUserIgnored,
};

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

// Message Counting

const getCountUserMessages = (db) => {
  return db.data.messageCount;
};

const isCountUserMessage = (db, authorId) => {
  return getCountUserMessages(db)
    .map((obj) => {
      return obj.userId;
    })
    .includes(authorId);
};

const addCountUserMessage = (db, authorId) => {
  if (!isCountUserMessage(db, authorId)) {
    db.data.messageCount.push({ "userId": authorId, "messageNumber": 0 });
    db.wasUpdated = true;
  }
}

const removeCountUserMessage = (db, authorId) => {
  if (isCountUserMessage(db, authorId)) {
    db.data.messageCount = db.data.messageCount.filter(({ userId }) => userId !== authorId );
    db.wasUpdated = true;
  }
}

export { isCountUserMessage, addCountUserMessage, removeCountUserMessage };
