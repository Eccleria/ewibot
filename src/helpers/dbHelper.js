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

// ALAVIRIEN.NE MESSAGE COUNTING

const isAlavirien = (db, authorId) => {
  return db.data.alavirien
    .map((obj) => {
      return obj.userId;
    })
    .includes(authorId);
};

const addAlavirienNumber = (db, authorId, number) => {
  db.data.alavirien.forEach((user) => {
    if (user.userId === authorId) {
      user.messageNumber += number;
      db.wasUpdated = true;
    }
  });
};

const addAlavirien = (db, authorId, number, date) => {
  if (!isAlavirien(db, authorId)) {
    db.data.alavirien.push({
      userId: authorId,
      messageNumber: number,
      joinAt: date,
    });
    db.wasUpdated = true;
  } else {
    addAlavirienNumber(db, authorId, number);
  }
};

const removeAlavirien = (authorId, db) => {
  if (isAlavirien(db, authorId)) {
    db.data.alavirien = db.data.alavirien.filter(
      ({ userId }) => userId !== authorId
    );
    db.wasUpdated = true;
  }
};

export { isAlavirien, addAlavirienNumber, addAlavirien, removeAlavirien };

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

//EVENTROLES
const getEventRoles = (db) => {
  return db.data.eventRoles;
};

const addEventRole = (db, guildId, roleName, roleId) => {
  const data = getEventRoles(db);
  const guildData = data.find((obj) => obj.guildId === guildId); //get correct server data

  if (guildData) {
    guildData[`${roleName}RoleId`] = roleId;
    db.wasUpdated = true;
    return true;
  } else return false;
};

const updateEventRoleMessageId = (db, guildId, messageId) => {
  const data = getEventRoles(db);
  const guildData = data.find((obj) => obj.guildId === guildId); //get correct server data
  guildData.roleMessageId = messageId;
  db.wasUpdated = true;
};

export { getEventRoles, addEventRole, updateEventRoleMessageId };

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

  if (!isMessageRecipient(db, recipientId)) {
    //ad user to db + message
    data.push({ userId: recipientId, messages: [toPush] });
  } else {
    const foundObject = data.find((obj) => obj.userId === recipientId);
    foundObject.messages.push(toPush); //add message
  }
  db.wasUpdated = true;
};

const removeGiftMessage = (db, senderId, recipientId = null) => {
  const data = db.data.gift.messages;
  if (recipientId) {
    if (isMessageRecipient(db, recipientId)) {
      //if is in appriopriate db
      const userData = data.find((obj) => obj.userId === recipientId);

      const results = userData.messages.reduce(
        (acc, cur) => {
          //{ userId: , messages: [{ senderId:, message: }] }
          if (cur.senderId === senderId)
            return { new: acc.new, removed: [...acc.removed, cur.message] };
          else return { new: [...acc.new, cur], removed: acc.removed };
        },
        { new: [], removed: [] }
      );

      //update db
      userData.messages = results.new;
      db.wasUpdated = true;

      return results.removed; //return messages for feedback
    } else return null;
  } else {
    return data.reduce((senderAcc, recipientObj) => {
      //recipientObj = {userId, messages}
      const foundMessages = recipientObj.messages.reduce(
        (acc, cur) => {
          //[{ senderId:, message: }, ...]
          if (cur.senderId === senderId)
            return { new: acc.new, removed: [...acc.removed, cur.message] };
          else return { new: [...acc.new, cur], removed: acc.removed };
        },
        { new: [], removed: [] }
      );

      //add foundMessages to overall found messages
      if (foundMessages.removed.length !== 0) {
        //update db
        recipientObj.messages = foundMessages.new;
        db.wasUpdated = true;
        return [
          ...senderAcc,
          { recipientId: recipientObj.userId, messages: foundMessages.removed },
        ];
      } else return senderAcc;
    }, []);
  }
};

const getGiftMessage = (db, senderId, recipientId = null) => {
  const data = db.data.gift.messages;

  if (recipientId) {
    const userData = data.find((obj) => obj.userId === recipientId);

    if (userData) {
      const messages = userData.messages.reduce((acc, cur) => {
        if (cur.senderId === senderId) return [...acc, cur.message];
        else return acc;
      }, []);
      if (messages.length !== 0)
        return [{ recipientId: recipientId, messages: messages }];
    }
    return [];
  } else {
    return data.reduce((senderAcc, recipientObj) => {
      //{userId, messages}
      const foundMessages = recipientObj.messages.reduce((acc, cur) => {
        //{senderId, message}
        if (cur.senderId == senderId) return [...acc, cur.message];
        else return acc;
      }, []);
      if (foundMessages.length !== 0)
        return [
          ...senderAcc,
          { recipientId: recipientObj.userId, messages: foundMessages },
        ];
      else return senderAcc;
    }, []);
  }
};

const addGiftSeparator = (db, separator) => {
  const data = db.data.gift.messages;
  data.forEach((obj) => {
    //{userId, messages}
    obj.messages.push({ senderId: null, message: separator });
  });
};

export {
  addGiftMessage,
  removeGiftMessage,
  isMessageRecipient,
  getGiftMessage,
  addGiftSeparator,
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

//TWITTER
const isTwitterUser = (authorId, db) => {
  return db.data.twitter.users
    .map((obj) => {
      return obj.userId;
    })
    .includes(authorId);
};

const getTwitterUser = (authorId, db) => {
  const twitter = db.data.twitter.users;
  if (isTwitterUser(authorId, db)) {
    for (const obj of twitter) {
      if (obj.userId === authorId) {
        return obj;
      }
    }
  }
};

const updateLastTweetId = (authorId, tweetId, db) => {
  const twitter = db.data.twitter.users;
  if (isTwitterUser(authorId, db)) {
    for (const obj of twitter) {
      if (obj.userId === authorId) {
        obj.lastTweetId = tweetId;
      }
    }
    db.wasUpdated = true;
  }
};

const addMissingTweets = (tweetIds, db) => {
  if (typeof tweetIds === "string")
    db.data.twitter.missingTweets.push(tweetIds);
  else db.data.twitter.missingTweets.push(...tweetIds);
  db.wasUpdated = true;
};

const removeMissingTweets = (tweetIds, db) => {
  const missingTweets = db.data.twitter.missingTweets;
  if (typeof tweetIds === "string")
    db.data.twitter.missingTweets = missingTweets.filter(
      (id) => tweetIds !== id
    );
  else
    db.data.twitter.missingTweets = missingTweets.filter(
      (id) => !tweetIds.includes(id)
    );
  db.wasUpdated = true;
};

export {
  getTwitterUser,
  updateLastTweetId,
  addMissingTweets,
  removeMissingTweets,
};

//STATS USER

const isUseStatUser = (authorId, db) => {
  return db.data.useStatUsers.includes(authorId)
};

const addUseStatUser = (authorId, db) => {
  if (!isUseStatUser(authorId, db))
    db.data.useStatUsers = [...db.data.useStatUsers, authorId];
};

const removeUseStatUser = (authorId, db) => {
  if (isUseStatUser(authorId, db))
    db.data.useStatUsers = db.data.useStatUsers.filter((id) => id !== authorId);
}

export { addUseStatUser, removeUseStatUser };

// {userId, stats...}
const addStatsUser = (authorId, db) => {
  if (!isStatsUser(authorId, db)) {
    db.data.statsUsers.push({
      userId: authorId,
      abcd: 0,
      apologies: 0,
      commands: {
        concrete: 0,
        ping: 0,
        reminder: 0,
        roll: 0
      },
      emotes: { total: 0, react: 0, inMessage: 0, emotes: [] },
      hello: 0,
      hungry: 0,
      message: 0,
      messageDelete: 0,
      messageUpdate: 0,
    });
    db.wasUpdated = true;
  }
};

const isStatsUser = (authorId, db) => {
  return db.data.statsUsers
    .map((obj) => {
      return obj.userId;
    })
    .includes(authorId);
};

const removeStatsUser = (authorId, db) => {
  if (isStatsUser(authorId, db)) {
    db.data.statsUsers = db.data.statsUsers.filter((cur) => cur.userId !== authorId);
    db.wasUpdated = true;
  }
};

export { addStatsUser, isStatsUser, removeStatsUser };

/**
 * Recursive function adding +1 to one user in its database stats values.
 * @param {string} authorId User id.
 * @param {any} db Client database.
 * @param {string} type Type of the data to add eg. apology, hungry...
 */
const addStatData = (authorId, db, type) => {
  const stats = db.data.statsUsers;

  if (isStatsUser(authorId, db)) {
    //If already in DB, add +1 to counter
    for (const obj of stats) {
      if (obj.userId === authorId && obj[type] !== undefined) obj[type]++;
    }
  } else if (isUseStatUser(authorId, db)) {
    //Else add user
    addStatsUser(authorId, db); //add to db
    addStatData(authorId, db, type); //add 1 to counter
  } else return
  db.wasUpdated = true;
};

const addCommandCount = (authorId, db, type) => {
  const stats = db.data.statsUsers;

  if (isStatsUser(authorId, db)) {
    //If already in DB, add +1 to counter
    for (const obj of stats) {
      if (obj.userId === authorId && obj[type] !== undefined) obj.commands[type]++;
    }
  } else if (isUseStatUser(authorId, db)) {
    //Else add user
    addStatsUser(authorId, db); //add to db
    addStatData(authorId, db, type); //add 1 to counter
  } else return
  db.wasUpdated = true;
};

const addEmoteCount = (authorId, db, emoteId, type) => {
  const stats = db.data.statsUsers; //[{ userId, apologies, hungry, emotes }, ...]
  console.log("stats", stats);
  if (isStatsUser(authorId, db)) {
    //if user is in db
    console.log("isStatUser");
    for (const obj of stats) {
      console.log("statObj", obj);
      if (obj.userId === authorId) {
        //find user data
        const emotesObj = obj.emotes; //{total:, emotes: [{emoteId, count}]}
        const emotes = emotesObj.emotes; //[{emoteId, count}]

        emotesObj.total++; //add +1 to total emote count
        if (type === "react") emotesObj.react++;
        else emotesObj.inMessage++;

        let flag = false; //check for emote presence in db
        for (const emote of emotes) {
          if (emote.emoteId === emoteId) {
            emote.count++; //if in db, add count
            flag = true;
          }
        }
        if (!flag) {
          //if flag === true, already added
          emotes.push({ emoteId: emoteId, count: 1 });
        }
      }
    }
  } else if (isUseStatUser(authorId, db)) {
    //Else if is useStatUser, add user
    addStatsUser(authorId, db); //add to db
    addStatData(authorId, db, emoteId); //add 1 to counter
  } else return
  db.wasUpdated = true;
};

const removeEmoteCount = (authorId, db, emoteId, type) => {
  const stats = db.data.statsUsers;
  console.log("stats", stats);
  if (isStatsUser(authorId, db)) {
    console.log("isStatUser");
    //[{ userId, apologies, hungry, emotes }, ...]
    for (const obj of stats) {
      if (obj.userId === authorId) {
        const emotesObj = obj.emotes; //{total:, emotes: [{emoteId, count}]}
        const emotes = emotesObj.emotes; //[{emoteId, count}]

        emotesObj.total--; //remove 1 to total emote count
        if (type === "react") emotesObj.react--;
        else emotesObj.inMessage--;

        //check for emote presence in db
        for (const emote of emotes) {
          if (emote.emoteId === emoteId) {
            emote.count--; //if in db, remove count
            db.wasUpdated = true;
          }
          //if not in db, nothing to do
        }
      }
    }
  }
};

export { addStatData, addCommandCount, addEmoteCount, removeEmoteCount };

//STATS SERVER

const addStatsServer = (db, typeCD, typePV, number = 1) => {
  const stats = db.data.statsServer;
  const toModify = stats[typeCD]; //cats or dogs
  console.log("toModify", toModify);
  db.data.statsServer[typeCD][typePV] = toModify[typePV] + number; //modify picture/video count
  db.data.statsServer[typeCD].total = toModify.total + number; //modify total count

  db.wasUpdated = true;
};

const removeStatsServer = (db, typeCD, typePV, number = 1) => {
  const stats = db.data.statsServer;
  const toModify = stats[typeCD]; //cats or dogs

  db.data.statsServer[typeCD][typePV] = toModify[typePV] - number; //modify picture/video count
  db.data.statsServer[typeCD].total = toModify.total - number; //modify total count

  db.wasUpdated = true;
};

export { addStatsServer, removeStatsServer };
