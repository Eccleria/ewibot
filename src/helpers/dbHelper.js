// APOLOGY COUNTING
const isApologyUser = (authorId, db) => {
  return db.data.apologiesCounting
    .map((obj) => {
      return obj.userId;
    })
    .includes(authorId);
};

const addApologyCount = (authorId, db) => {
  const { apologiesCounting } = db.data;

  if (isApologyUser(authorId, db)) {
    // If already in DB, add +1 to the counter
    for (const obj of apologiesCounting) {
      if (obj.userId === authorId) {
        obj.counter++;
      }
    }
  } else {
    // Else add user
    db.data.apologiesCounting = [
      ...db.data.apologiesCounting,
      { userId: authorId, counter: 1 },
    ];
  }
  db.wasUpdated = true;
};

export { isApologyUser, addApologyCount };

// BIRTHDAY
const isBirthdayDate = (authorId, db) => {
  return db.data.birthdaysUsers
    .map((obj) => {
      return obj.userId;
    })
    .includes(authorId);
};

const addBirthday = (authorId, db, birthday) => {
  db.data.birthdaysUsers = [
    ...db.data.birthdaysUsers.filter(({ userId }) => userId !== authorId),
    { userId: authorId, birthdayDate: birthday },
  ];
  db.wasUpdated = true;
};

const removeBirthday = (authorId, db) => {
  if (isBirthdayDate(authorId, db)) {
    db.data.birthdaysUsers = db.data.birthdaysUsers.filter(
      ({ userId }) => userId !== authorId
    );
    db.wasUpdated = true;
  }
};

export { addBirthday, removeBirthday, isBirthdayDate };

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

const isIgnoredUser = (authorId, db) => {
  return db.data.ignoredUsersIds.includes(authorId);
};

export { addIgnoredUser, removeIgnoredUser, isIgnoredUser };

// MESSAGE COUNTING

const isUserMessagesCounted = (db, authorId) => {
  return db.data.messageCount
    .map((obj) => {
      return obj.userId;
    })
    .includes(authorId);
};

const addMessageCount = (db, authorId, number) => {
  db.data.messageCount.forEach((user) => {
    if (user.userId === authorId) {
      user.messageNumber += number;
      db.wasUpdated = true;
    }
  })
};

const addUserMessageCount = (db, authorId, number) => {
  if (!isUserMessagesCounted(db, authorId)) {
    db.data.messageCount.push({ userId: authorId, messageNumber: number });
    db.wasUpdated = true;
  } else {
    addMessageCount(db, authorId, number);
  }
};

const removeUserMessageCount = (db, authorId) => {
  if (isUserMessagesCounted(db, authorId)) {
    db.data.messageCount = db.data.messageCount.filter(
      ({ userId }) => userId !== authorId
    );
    db.wasUpdated = true;
  }
};

export { isUserMessagesCounted, addUserMessageCount, removeUserMessageCount };
