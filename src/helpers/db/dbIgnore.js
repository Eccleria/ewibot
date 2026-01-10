import { dbAdmin } from "./database.js";

//IGNORE CHANNEL
const isIgnoredChannel = (db, channelId) => {
  dbAdmin.all("SELECT * FROM ignoreChannels WHERE channelId=?", [channelId], (err, rows) => {
    console.error(err);
    console.log("rows", rows);
  });
  return db.data.ignoredChannelIds.includes(channelId);
};

const addIgnoredChannel = (db, channelId) => {
  if (!isIgnoredChannel(db, channelId)) {
    console.log("add", channelId);
    const query = "INSERT INTO ignoreChannels(channelId) VALUES(?)";
    dbAdmin.run(query, [channelId], console.error);
    db.data.ignoredChannelIds.push(channelId);
  }
  db.wasUpdated = true;
};

const removeIgnoredChannel = (db, channelId) => {
  if (isIgnoredChannel(db, channelId)) {
    db.data.ignoredChannelIds = db.data.ignoredChannelIds.filter(
      (id) => id !== channelId,
    );
  }
  db.wasUpdated = true;
};

export { isIgnoredChannel, addIgnoredChannel, removeIgnoredChannel };

// IGNORED USERS
const addIgnoredUser = (db, authorId) => {
  if (!db.data.ignoredUsersIds.includes(authorId)) {
    db.data.ignoredUsersIds.push(authorId);
  }
  db.wasUpdated = true;
};

const removeIgnoredUser = (db, authorId) => {
  if (db.data.ignoredUsersIds.includes(authorId)) {
    db.data.ignoredUsersIds = db.data.ignoredUsersIds.filter(
      (id) => id !== authorId,
    );
  }
  db.wasUpdated = true;
};

const isIgnoredUser = (db, authorId) => {
  return db.data.ignoredUsersIds.includes(authorId);
};

export { addIgnoredUser, removeIgnoredUser, isIgnoredUser };
