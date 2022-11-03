// ADMIN
const addAdminLogs = (db, messageId, type, index) => {
  const adminLogs = db.data.adminLogs;
  //{frequent: [[]...], userAD: [[]...]}
  const data = adminLogs[type]; // [[]...]

  data[index].push(messageId);
  db.wasUpdated = true;
};

const getAdminLogs = (db) => {
  return db.data.adminLogs;
};

const removeAdminLogs = (db, type) => {
  const adminLogs = db.data.adminLogs;
  //{frequent: [[]...], userAD: [[]...]}
  const data = adminLogs[type]; // [[]...]
  const sliced = data.slice(1); //remove first
  sliced.push([]); //add [] at the end

  db.data.adminLogs[type] = sliced;
  db.wasUpdated = true;
};

export { addAdminLogs, getAdminLogs, removeAdminLogs };

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

const removeAppologyCount = (authorId, db) => {
  if (isApologyUser(authorId, db)) {
    db.data.apologiesCounting = db.data.apologiesCounting.filter(
      (cur) => cur.userId !== authorId
    );
    db.wasUpdated = true;
  }
};

export { isApologyUser, addApologyCount, removeAppologyCount };

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

//GIFT
const isGiftUser = (db, userId) => {
  return db.data.gift.users.includes(userId);
};

const addGiftUser = (db, userId) => {
  if (!isGiftUser(db, userId)) {
    db.data.gift.users.push(userId);
    db.wasUpdated = true;
  }
};

const removeGiftUser = (db, userId) => {
  const data = db.data.gift.users;
  if (isGiftUser(db, userId)) {
    db.data.gift.users = data.filter((id) => id !== userId);
    db.wasUpdated = true;
  }
};

export { isGiftUser, addGiftUser, removeGiftUser };

const isMessageRecipient = (db, recipientId) => {
  return db.data.gift.messages.map((obj) => obj.userId).includes(recipientId);
};

const addGiftMessage = (db, recipientId, content, senderId) => {
  const data = db.data.gift.messages;
  const toPush = { senderId: senderId, message: content };
  if (!isMessageRecipient(db, recipientId)) //ad user to db + message
    data.push({ userId: recipientId, messages: [toPush] });
  else {
    const user = data.find((obj) => obj.userId = recipientId);
    user.messages.push(toPush); //add message
  }
  db.wasUpdated = true;
};

const removeGiftMessage = (db, recipientId, senderId) => {
  const data = db.data.gift.messages;

  if (isMessageRecipient(db, recipientId)) { //if is in appriopriate db
    const results = data.reduce((acc, cur) => {
      if (cur.senderId === senderId)
        return { new: acc.new, removed: [...acc.removed, cur.message] }
      else return { new: [...acc.new, cur], removed: acc.removed };
    }, { new: [], removed: [] });

    //update db
    db.data.gift.messages = results.new; 
    db.wasUpdated = true;

    return results.removed; //return messages for feedback
  } else return null
};

export { addGiftMessage, removeGiftMessage };

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
