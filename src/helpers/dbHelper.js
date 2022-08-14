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
    db.data.stats.push({
      userId: authorId,
      apologies: 0,
      emotes: { total: 0, react: 0, inMessage: 0, emotes: [] },
      hungry: 0,
      messageDelete: 0,
      messageUpdate: 0,
    });
    db.wasUpdated = true;
  }
};

const isStatsUser = (authorId, db) => {
  return db.data.stats
    .map((obj) => {
      return obj.userId;
    })
    .includes(authorId);
};

const removeStatsUser = (authorId, db) => {
  if (isStatsUser(authorId, db)) {
    db.data.stats = db.data.stats.filter((cur) => cur.userId !== authorId);
    db.wasUpdated = true;
  }
};

export { addStatsUser, removeStatsUser };

/**
 * Recursive function adding +1 to one user in its database stats values.
 * @param {string} authorId User id.
 * @param {any} db Client database.
 * @param {string} type Type of the data to add eg. apology, hungry...
 */
const addStatData = (authorId, db, type) => {
  const { stats } = db.data;

  if (isStatsUser(authorId, db)) {
    //If already in DB, add +1 to counter
    for (const obj of stats) {
      if (obj.userId === authorId && obj[type] !== undefined) obj[type]++;
    }
  } else {
    //Else add user
    addStatsUser(authorId, db); //add to db
    addStatData(authorId, db, type); //add 1 to counter
  }
  db.wasUpdated = true;
};

const addEmoteCount = (authorId, db, emoteId, type) => {
  const stats = db.data.stats; //[{ userId, apologies, hungry, emotes }, ...]
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
        db.wasUpdated = true;
      }
    }
  } else {
    //not in db => add it
    addStatsUser(authorId, db);
    addEmoteCount(authorId, db, emoteId);
  }
};

const removeEmoteCount = (authorId, db, emoteId, type) => {
  const stats = db.data.stats;
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

export { addStatData, addEmoteCount, removeEmoteCount };
