import { isIgnoredUser, addApologyCount, isIgnoredChannel } from "./index.js";

export const isCommand = (content) => content[0] === "$"; // check if is an Ewibot command

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

const ADMINS = ["141962573900808193", "290505766631112714"]; // Ewibot Admins' Ids

const punctuation = [".", ",", ":", "!", "?", ";"];

export const sanitizeContent = (messageContent) => {
  return messageContent.map((letter) => {
    if (!punctuation.includes(letter)) return letter;
  })
};

export const isAdmin = (authorId) => {
  // Check if is admin users
  return ADMINS.includes(authorId);
};

const isAbcd = (words) => {
  // Check if message content is having all words first letters in alphabetic order
  if (words.length >= 4) {
    // Need at least 4 words
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
  currentServer,
  client
) => {
  const db = client.db;
  const authorId = message.author.id;

  if (isIgnoredUser(authorId, db) || isIgnoredChannel(db, message.channel.id))
    return; //check for ignore users or channels

  const words = message.content.toLowerCase().split(" ");

  // If message contains apology, Ewibot reacts
  if (apologies.some((apology) => words.some((word) => word === apology))) {
    addApologyCount(authorId, db);
    await message.react(currentServer.panDuomReactId);
  }

  if (isAbcd(words)) await message.react(currentServer.eyeReactId);

  if (Math.random() < 0.8) return; // Limit Ewibot react frequency

  if (hello.some((helloMessage) => words[0] === helloMessage)) {
    await message.react(currentServer.helloEmoji);
  }

  // Ewibot reacts with the same emojis that are inside the message
  const emotes = Object.values(currentServer.autoEmotes);
  for (const word of words) {
    const foundEmotes = emotes.filter((emote) => word.includes(emote)); // If the emoji is in the commons.json file
    for (const e of foundEmotes) {
      await message.react(e);
    }
  }
};

export const checkIsOnThread = async (channel, threadId) => {
  // If Ewibot not in the thread, add Ewibot
  const thread = channel.isThread
    ? null
    : channel.threads.cache.find((x) => x.id === threadId);
  if (thread && thread.joinable) await thread.join();
};
