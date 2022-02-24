import dotenv from "dotenv";
dotenv.config();

import {
  isIgnoredUser,
  addApologyCount,
  isIgnoredChannel,
} from "./dbHelper.js";

export const isCommand = (content) => content[0] === "$";

const apologies = [
  "desolé",
  "desolée",
  "desole",
  "desolee",
  "dsl",
  "sorry",
  "sry",
  "desoler",
  "désolé",
  "désolée",
  "désoler",
  "pardon",
  "navré",
  "navrée",
  "deso",
  "déso",
];

const hello = [
  "bonjour",
  "hello",
  "yo",
  "salut",
  "bonsoir",
  "coucou",
  "bijour",
  "bonjoir",
  "hey",
];

const ADMINS = ["141962573900808193", "290505766631112714"];

export const isAdmin = (authorId) => {
  return ADMINS.includes(authorId);
};

const isAbcd = (words) => {
  if (words.length >= 4) {
    const reduced = words.reduce(
      (precedent, current) => {
        const unicodeWord = current.charCodeAt(0);
        if (unicodeWord >= 97 && unicodeWord <= 122)
          return {
            latestUnicode: unicodeWord,
            isAbcd: precedent.isAbcd && unicodeWord > precedent.latestUnicode,
          };
        else return { latestUnicode: unicodeWord, isAbcd: false };
      },
      { latestUnicode: null, isAbcd: true }
    );
    return reduced.isAbcd;
  }
  return false;
};

export const reactionHandler = async (
  message,
  messageContent,
  currentServer,
  client
) => {
  const loweredMessage = messageContent.toLowerCase();
  const db = client.db;
  const authorId = message.author.id;

  if (isIgnoredUser(authorId, db) || isIgnoredChannel(db, message.channel.id))
    return;

  const words = loweredMessage.split(" ");
  if (apologies.some((apology) => words.some((word) => word === apology))) {
    addApologyCount(authorId, db);
    await message.react(currentServer.autoEmotes.panDuomReactId);
  }

  if (isAbcd(words)) await message.react(currentServer.eyeReactId);

  if (Math.random() < 0.8) return;

  if (hello.some((helloMessage) => words[0] === helloMessage)) {
    await message.react(currentServer.helloEmoji);
  }
  const emotes = Object.values(currentServer.autoEmotes);
  for (const word of words) {
    const foundEmotes = emotes.filter((emote) => word.includes(emote));
    for (const e of foundEmotes) {
      await message.react(e);
    }
  }
};

export const checkIsOnThread = async (channel, threadId) => {
  const thread = channel.isThread
    ? null
    : channel.threads.cache.find((x) => x.id === threadId);
  if (thread && thread.joinable) await thread.join();
};
