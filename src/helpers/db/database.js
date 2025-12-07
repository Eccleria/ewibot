import sqlite3 from "sqlite3";

const apologiesTable = `CREATE TABLE IF NOT EXISTS apologies(

)`

const ignoreChannelsTable = `CREATE TABLE IF NOT EXISTS ignoreChannels(
  channelId TEXT NOT NULL
)`;

const ignoreUsersTable = `CREATE TABLE IF NOT EXISTS ignoreUsers(
  userId TEXT NOT NULL
)`;

const reminderTable = `CREATE TABLE IF NOT EXISTS reminder(
  userId            TEXT NOT NULL,
  answerId          TEXT PRIMARY KEY NOT NULL,
  requestChannelId  TEXT NOT NULL,
  answerChannelId   TEXT NOT NULL,
  reminderTime      TEXT NOT NULL,
  content           TEXT NOT NULL
  )`;

const pollsTable = ``;

const dbOpenParam = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;
const path = "./db/";
export const dbAdmin = new sqlite3.Database(path + "admin.db", dbOpenParam, console.error);
export const dbStats = new sqlite3.Database(path + "stats.db", dbOpenParam);
export const dbPolls = new sqlite3.Database(path + "polls.db", dbOpenParam);
export const dbUsers = new sqlite3.Database(path + "users.db", dbOpenParam);

export const initDB = async () => {
  //admin
  dbAdmin.run(ignoreChannelsTable);

  //polls 

  //stats

  //users
  dbAdmin.run(ignoreUsersTable);
};
