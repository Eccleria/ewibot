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
  "hey",
  "👋",
];

const ADMINS = ["141962573900808193", "290505766631112714"]; // Ewibot Admins' Ids

const punctuation = new RegExp(/[!"#$%&'()*+,\-.:;<=>?@[\]^_`{|}~…]/gm);

export const sanitizePunctuation = (messageContent) => {
  const lineBreakRemoved = messageContent.replaceAll("\n", " ");
  return lineBreakRemoved.replaceAll(punctuation, "");
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
  if (process.env.DEBUG === "yes") console.log("apologyResult", apologyResult);

  apologyRegex.lastIndex = 0; //reset lastIndex, needed for every check
  if (apologyResult !== null) {
    //if found apology
    const splited = sanitizedContent.split(" "); //split words
    const idx = apologyResult.index;

    if (process.env.DEBUG === "yes")
      console.log("splited.length", splited.length, "apologyResult.index", idx);

    const result = splited.reduce(
      (acc, cur) => {
        const newLen = acc.len + cur.length + 1;
        if (process.env.DEBUG === "yes") {
          console.log("len", acc.len, "newLen", newLen, "cur", [cur]);
          console.log(cur.length, sanitizedContent[newLen], "word", acc.word);
        }
        if (acc.len <= idx && idx < newLen) {
          if (process.env.DEBUG === "yes") console.log("found");
          return { word: acc.word || cur, len: newLen, nb: acc.nb + 1 };
        } else return { word: acc.word, len: newLen, nb: acc.nb };
      },
      { word: null, len: 0, nb: 0 }
    );
    const wordFound = result.word;

    if (process.env.DEBUG === "yes") console.log("wordFound", [wordFound]);

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

  if (isIgnoredUser(db, authorId) || isIgnoredChannel(db, message.channel.id))
    return; //check for ignore users or channels

  // If message contains apology, Ewibot reacts
  if (process.env.DEBUG === "yes")
    console.log("loweredContent", [loweredContent]);
  const sanitizedContent = sanitizePunctuation(loweredContent); //remove punctuation
  if (process.env.DEBUG === "yes")
    console.log("sanitizedContent", [sanitizedContent]);

  if (hasApology(sanitizedContent)) {
    addApologyCount(db, authorId); //add data to db
    await message.react(currentServer.panDuomReactId); //add message reaction
  }

  const words = loweredContent.split(" "); //split message content into a list of words
  if (isAbcd(words)) await message.react(currentServer.eyeReactId);

  //if ewibot is mentionned, react
  if (message.mentions.has(process.env.CLIENTID))
    await message.react(currentServer.rudolphslichId);

  const frequency = Math.random() > 0.8; // Limit Ewibot react frequency

  //Ewibot wave to user
  if (hello.some((helloMessage) => words[0] === helloMessage) && frequency) {
    await message.react(cmnShared.helloEmoji);
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

// ACTIVITY

// activity list
const activityList = [
  { name: "Adrien Sépulchre", type: "LISTENING" },
  { name: "JDR Ewilan par Charlie", type: "PLAYING" },
  {
    name: "Ewilan EP" + (Math.round(7 * Math.random()) + 1).toString(),
    type: "WATCHING",
  },
  { name: "la bataille contre Azan", type: "COMPETING" },
  { name: "la création d'Al-Jeit", type: "COMPETING" },
  { name: "épier les clochinettes", type: "PLAYING" },
  { name: "compter les poêles", type: "PLAYING" },
];

/**
 * Set the timeout for bot activity update.
 * @param {Object} client The bot Client.
 */
export const updateActivity = (client) => {
  // set random waiting time for updating Ewibot activity

  const waitingTime = (20 * Math.random() + 4) * 3600 * 1000;
  setTimeout(() => {
    setActivity(client);
    updateActivity(client);
  }, waitingTime);
};

/**
 * Set the bot client activity with a random choice from activityList.
 * @param {Object} client The bot Client.
 */
export const setActivity = (client) => {
  // randomise Ewibot activity
  const statusLen = activityList.length - 1;
  const rdmIdx = Math.round(statusLen * Math.random());
  const whichStatus = activityList[rdmIdx];

  //set client activity
  client.user.setActivity(whichStatus);
};
