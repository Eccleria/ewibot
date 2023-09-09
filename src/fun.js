import {
  //db
  isIgnoredUser,
  addApologyCount,
  isIgnoredChannel,
  //utils
  hasApology,
  hasOctagonalSign,
  removePunctuation,
} from "./helpers/index.js";
import { octagonalLog } from "./admin/utils.js";
import { COMMONS } from "./commons.js";

//#region ACTIVITY
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

//#endregion

//#region readContentAndReact
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

/**
 * Analyse message content and makes bot react accordingly
 * @param {object} message Message object with content to read
 * @param {object} currentServer common.json object, related to message.guild.id
 * @returns
 */
export const readContentAndReact = async (message, currentServer) => {
  const db = message.client.db;
  const authorId = message.author.id;

  const cmnShared = COMMONS.getShared();

  const loweredContent = message.content.toLowerCase(); //get text in Lower Case
  if (hasOctagonalSign(loweredContent, cmnShared)) octagonalLog(message); //if contains octagonal_sign, log it

  if (isIgnoredUser(db, authorId) || isIgnoredChannel(db, message.channel.id))
    return; //check for ignore users or channels

  // If message contains apology, Ewibot reacts
  if (process.env.DEBUG === "yes")
    console.log("loweredContent", [loweredContent]);
  const sanitizedContent = removePunctuation(loweredContent); //remove punctuation
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

//#endregion
