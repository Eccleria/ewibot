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

  //STATS
  // {userId, stats...}
const addStatsUser = (authorId, db) => {
  if (!isStatsUser(authorId, db)) {
    db.data.stats.push({ userId: authorId, apologies: 0, emotes: [], hungry: 0 })
    db.wasUpdated = true;
  }
};

const isStatsUser = (authorId, db) => {
  return db.data.stats.map((obj) => {
    return obj.userId;
  }).includes(authorId)
}

const removeStatsUser = (authorId, db) => {
  if (isStatsUser(authorId, db)) {
    db.data.stats = db.data.stats.filter(
      (cur) => cur.userId !== authorId
    );
    db.wasUpdated = true;
  }
};

export { addStatsUser, removeStatsUser };

const addApologyCount = (authorId, db) => {
  //Apology count
  const { stats } = db.data;

  if (isStatsUser(authorId, db)) {
    //If already in DB, add +1 to counter
    for (const obj of stats) {
      if (obj.userId === authorId) {
        obj.apologies++;
      }
    }
  } else {
    //Else add user
    addStatsUser(authorId, db); //add to db
    addApologyCount(authorId, db); //add 1 to counter
  }
  db.wasUpdated = true;
};

const addHungryCount = (authorId, db) => {
  //Hungry count
  const { stats } = db.data;

  if (isStatsUser(authorId, db)) {
    //If already in DB, add +1 to counter
    for (const obj of stats) {
      if (obj.userId === authorId) {
        obj.hungry++;
      }
    }
  } else {
    //Else add user
    addStatsUser(authorId, db); //add to db
    addHungryCount(authorId, db); //add 1 to counter
  }
  db.wasUpdated = true;
}

const addEmoteCount = (authorId, db, emoteId) => {
  const stats = db.data.stats;
  console.log("stats", stats)
  if (isStatsUser(authorId, db)) {
    console.log("isStatUser")
    //[{ userId, apologies, hungry, emotes }, ...]
    for (const obj of stats) {
      console.log("statObj", obj)
      if (obj.userId === authorId) {
        //[{emoteId, count}]
        const emotes = obj.emotes;

        let flag = false; //check for emote presence in db
        for (const emote of emotes) {
          if (emote.emoteId === emoteId) {
            emote.count++; //add count
            flag = true;
          }
        }
        if (!flag) {
          obj.emotes.push({ emoteId: emoteId, count: 1 });
        }
      }
    }
  }
  else {
    addStatsUser(authorId, db);
    addEmoteCount(authorId, db, emoteId);
  }
  db.wasUpdated = true;
};

export { addApologyCount, addHungryCount, addEmoteCount };