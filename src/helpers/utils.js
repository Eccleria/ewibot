import { isIgnoredUser, addApologyCount, isIgnoredChannel } from "./index.js";
import { octagonalLog } from "../admin/utils.js";
import { COMMONS } from "../commons.js";

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

export const hasOctagonalSign = (content, cmnShared) => {
  return content.includes(cmnShared.octagonalSignEmoji);
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

export const reactionHandler = async (message, currentServer, client) => {
  const db = client.db;
  const authorId = message.author.id;

  const cmnShared = COMMONS.getShared();

  const loweredContent = message.content.toLowerCase(); //get text in Lower Case
  if (hasOctagonalSign(loweredContent, cmnShared)) octagonalLog(message); //if contains octagonal_sign, log it

  if (isIgnoredUser(authorId, db) || isIgnoredChannel(db, message.channel.id))
    return; //check for ignore users or channels

  // If message contains apology, Ewibot reacts
  const sanitizedContent = sanitizePunctuation(loweredContent); //remove punctuation
  if (hasApology(sanitizedContent)) {
    addApologyCount(authorId, db); //add data to db
    await message.react(currentServer.panDuomReactId); //add message reaction
  }

  const words = loweredContent.split(" "); //split message content into a list of words
  if (isAbcd(words)) await message.react(currentServer.eyeReactId);

  const frequency = Math.random() > 0.8; // Limit Ewibot react frequency

  //Ewibot wave to user
  if (hello.some((helloMessage) => words[0] === helloMessage) && frequency) {
    await message.react(cmnShared.helloEmoji);
  }

  // Ewibot reacts with the same emojis that are inside the message
  const emotes = Object.values(currentServer.autoEmotes);
  const today = new Date();

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
    const reaction = Object.values(currentServer.hungryEmotes);
    const random = Math.round(Math.random()); // 0 or 1
    if (frequency) message.react(reaction[random]);
  }

  if (authorId === cmnShared.LuciferId) {
    //if Lucifer
    const presqueRegex = new RegExp(/pres(qu|k)e *(16|seize)/gim); //regex for presque 16 detection
    const presqueResult = presqueRegex.exec(sanitizedContent); //check if contains presque 16

    presqueRegex.lastIndex = 0; //reset lastIndex, needed for every check

    if (presqueResult !== null)
      await message.react(currentServer.panDuomReactId); //add message reaction
  }
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
  setInterval(() => {
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
