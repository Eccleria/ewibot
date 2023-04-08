import {
  isIgnoredUser,
  isIgnoredChannel,
  addEmoteCount,
  removeEmoteCount,
  addStatData,
  addStatsServer,
  removeStatsServer,
  isStatsUser,
} from "./index.js";
import { octagonalLog } from "../admin/utils.js";

export const isCommand = (content) => content[0] === "$"; // check if is an Ewibot command

const apologyRegex = new RegExp( //regex for apology detection
  /(d[ée]*sol*[eé]*[sr]?)|(dsl[eé]*)|(so?r+y)|(pardo+n+)|(navr[eé]+)/gm
);

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

const punctuation = new RegExp(/[!"#$%&'()*+,\-.:;<=>?@[\]^_`{|}~…]/gm);

export const sanitizePunctuation = (messageContent) => {
  return messageContent.replaceAll(punctuation, "");
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

const isHungry = (loweredContent) => {
  return loweredContent.includes("faim");
};

export const hasOctagonalSign = (content, currentServer) => {
  return content.includes(currentServer.octagonalSign);
};

export const hasApology = (sanitizedContent) => {
  const apologyResult = apologyRegex.exec(sanitizedContent); //check if contains apology
  apologyRegex.lastIndex = 0; //reset lastIndex, needed for every check
  if (apologyResult !== null) {
    //if found apology
    const wordFound = apologyResult.input //get triggering word
      .slice(apologyResult.index) //remove everything before word detected
      .split(" ")[0]; //split words and get the first

    //verify correspondance between trigerring & full word for error mitigation
    if (apologyResult[0] === wordFound) return true;
  }
  return false;
};

/**
 * Dispatch data to add/removeEmoteCount.
 * @param {string} emoteId The emoji id.
 * @param {object} user The user object that used this emote.
 * @param {string} [typeAR] "add" for adding data, nothing for remove.
 * @param {string} [typeReaction] "react" for reaction, null for inMessage emote.
 */
export const emojiStat = (emoteId, user, typeAR, typeReaction) => {
  const client = user.client;
  const db = client.db;
  const authorId = user.id;

  if (typeAR === "add") addEmoteCount(authorId, db, emoteId, typeReaction);
  else removeEmoteCount(authorId, db, emoteId, typeReaction);
};

export const wordEmojiDetection = (message, client) => {
  //get every emote occurence
  //client: [{id:, name:}];
  const clientEmotes = client.emotes; //get client emotes
  const emoteIds = clientEmotes.map((obj) => obj.id); //regroup ids

  const words = message.content.split(" "); //get words

  const onlyEmotes = words.reduce((acc, cur) => {
    //get only ids of emote from server
    if (cur.includes("<:")) {
      //if emote
      console.log("cur", cur)
      const parsed = cur.slice(2, -1).split(":"); //[name, id]
      console.log("parsed", parsed)
      const id = parsed[1]; //get id
      if (emoteIds.includes(id)) return [...acc, id]; //if server emote, return id
      else return acc; //not server emote
    } else return acc; //not emote
  }, []);
  console.log("onlyEmotes", onlyEmotes);
  if (onlyEmotes.length > 1) {
    const sortedEmotes = onlyEmotes.sort((a, b) => a - b); //sort by ids
    return sortedEmotes;
  }
  return onlyEmotes
};

export const reactionHandler = async (message, currentServer, client) => {
  const db = client.db;
  const authorId = message.author.id;

  const loweredContent = message.content.toLowerCase(); //get text in Lower Case
  if (hasOctagonalSign(loweredContent, currentServer)) octagonalLog(message); //if contains octagonal_sign, log it

  if (isIgnoredUser(authorId, db) || isIgnoredChannel(db, message.channel.id))
    return; //check for ignore users or channels

  // If message contains apology, Ewibot reacts
  const sanitizedContent = sanitizePunctuation(loweredContent); //remove punctuation
  if (hasApology(sanitizedContent)) {
    if (isStatsUser(db, authorId)) addStatData(authorId, db, "apology"); //add data to db
    await message.react(currentServer.panDuomReactId); //add message reaction
  }

  if (hasOctagonalSign(loweredContent, currentServer)) octagonalLog(message);

  const words = loweredContent.split(" ");
  if (isAbcd(words)) {
    if (isStatsUser(db, authorId)) addStatData(authorId, db, "abcd"); //add data to db
    await message.react(currentServer.eyeReactId);
  }

  //handle emoji stats
  const foundEmotes = wordEmojiDetection(message, client);
  if (foundEmotes.length !== 0 && isStatsUser(db, authorId))
    foundEmotes.forEach((emoteId) => emojiStat(emoteId, message.author, "add"));

  const frequency = Math.random() > 0.8; // Limit Ewibot react frequency

  //Ewibot wave to user
  if (hello.some((helloMessage) => words[0] === helloMessage)) {
    if (isStatsUser(db, authorId)) addStatData(authorId, db, "hello"); //add data to db
    if (frequency) await message.react(currentServer.helloEmoji);
  }

  //April
  const today = new Date();
  if (today.getMonth() === 3 && today.getDate() === 1 && frequency) {
    message.react("🐟");
  }

  // Ewibot reacts with the same emojis that are inside the message
  const emotes = Object.values(currentServer.autoEmotes);

  for (const word of words) {
    const foundEmotes = emotes.filter((emote) => word.includes(emote)); // If the emoji is in the commons.json file
    if (foundEmotes.length > 0 && frequency) {
      if (today.getMonth() == 5) {
        //PRIDE MONTH, RAIBOWSSSSS
        await message.react("🏳️‍🌈");
      } else if (today.getMonth() == 11) {
        await message.react(currentServer.rudolphslichId);
      } else if (today.getMonth() === 0 && today.getDate() === 1) {
        message.react("🎂");
      } else {
        for (const e of foundEmotes) {
          await message.react(e);
        }
      }
    }
  }

  // If users say they are hungry
  if (isHungry(loweredContent)) {
    const reaction = Object.values(currentServer.hungryEmotes); //get reaction
    const random = Math.round(Math.random()); // 0 or 1 => choose reaction
    message.react(reaction[random]); //add reaction

    if (isStatsUser(db, authorId)) addStatData(authorId, db, "hungry"); //add to db
    if (frequency) message.react(reaction[random]);
  }

  if (authorId === currentServer.LuciferId) {
    //if Lucifer
    const presqueRegex = new RegExp(/pres(qu|k)e *(16|seize)/gim); //regex for presque 16 detection
    const presqueResult = presqueRegex.exec(sanitizedContent); //check if contains presque 16

    presqueRegex.lastIndex = 0; //reset lastIndex, needed for every check

    if (presqueResult !== null)
      await message.react(currentServer.panDuomReactId); //add message reaction
  }
};

export const checkIsOnThread = async (channel, threadId) => {
  // If Ewibot not in the thread, add Ewibot
  const thread = channel.isThread
    ? null
    : channel.threads.cache.find((x) => x.id === threadId);
  if (thread && thread.joinable) await thread.join();
};

/**
 * Get every emoji from currentServer & save it in client.
 * @param {any} client
 * @param {any} commons
 */
export const emojiInit = async (client, commons) => {
  const server =
    process.env.DEBUG === "yes"
      ? commons.find(({ name }) => name === "test")
      : commons.find(({ name }) => name === "prod");
  const guildId = server.guildId;

  const guild = await client.guilds.fetch(guildId); //get current guild
  const emotes = await guild.emojis.fetch(); //get all emojis

  const toClient = emotes.reduce((acc, cur) => {
    return [...acc, { id: cur.id, name: cur.name }];
  }, []); //stored as [{id:, name:}];
  console.log("toClient", toClient);
  client.emotes = toClient;
};

export const catAndDogsCount = (client, attachments, typeCD, typeAR) => {
  const db = client.db;
  attachments.forEach((cur) => {
    const attType = cur.contentType;
    if (attType.startsWith("video")) {
      const typePV = "video";
      if (typeAR === "add") addStatsServer(db, typeCD, typePV);
      else if (typeAR === "remove") removeStatsServer(db, typeCD, typePV);
    } else if (attType.startsWith("image")) {
      const typePV = "image";
      if (typeAR === "add") addStatsServer(db, typeCD, typePV);
      else if (typeAR === "remove") removeStatsServer(db, typeCD, typePV);
    }
  })
};

// activity list
const activityList = [
  { name: "La Quête d'Ewilan", type: "WATCHING" },
  { name: "Adrien Sépulchre", type: "LISTENING" },
  { name: "JDR Ewilan par Charlie", type: "PLAYING" },
  { name: "Ewilan EP1", type: "WATCHING" },
  { name: "l'affrontement contre Azan", type: "COMPETING" },
];

export const updateActivity = (client) => {
  // set random waiting time for updating Ewibot activity

  const waitingTime = (20 * Math.random() + 4) * 3600 * 1000;
  setTimeout(() => {
    setActivity(client);
    updateActivity(client);
  }, waitingTime);
};

export const setActivity = (client) => {
  // randomise Ewibot activity
  const statusLen = activityList.length - 1;
  const rdmIdx = Math.round(statusLen * Math.random());
  const whichStatus = activityList[rdmIdx];

  //set client activity
  client.user.setActivity(whichStatus);
};
