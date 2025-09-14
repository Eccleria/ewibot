import { ActivityType } from "discord.js";
import {
  //db
  addApologyCount,
  addStatsData,
  dbReturnType,
  isIgnoredChannel,
  isIgnoredUser,
  isStatsUser,
  statsKeys,
  //utils
  hasApology,
  removePunctuation,
} from "./helpers/index.js";
import { COMMONS } from "./commons.js";

//#region ACTIVITY

const optionalActivities = () => {
  let activities = [];
  //halloween
  const today = new Date();
  if (today.getMonth() == 9 && today.getDate() == 31)
    activities = [
      ...activities,
      { name: "compter ses bonbons", type: ActivityType.Playing, state: "Il en manque un !", weight: 10 },
    ];
  return activities;
};

// activity list
const buildActivityList = () => {
  const activityList = [
    { name: "Adrien Sépulchre", type: ActivityType.Listening, state: "Quel talent ..." },
    { name: "JDR Ewilan par Charlie", type: ActivityType.Playing, state: "C'est quand qu'on arrive ?" },
    { name: "le Chant de la Dame", type: ActivityType.Listening, state: "Courbes innées en ondoyantes circonvolutions. Onde infinie gourgeoyante d'harmonie plongée au cœur des océans d'étoiles." },
    { name: "la création d'Al-Jeit", type: ActivityType.Competing, state: "😎" },
    { name: "épier les clochinettes", type: ActivityType.Playing, state: "...c'est quoi en fait une clochinette ?" },
    { name: "bétonner les gens", type: ActivityType.Playing, state: "Hehehe béton" },
    ...optionalActivities(),
  ];

  //add Ewilan episodes
  const array = Array.from(new Array(7));
  const EwilanList = array.reduce((acc, _cur, idx) => {
    const element = {
        name: "Ewilan EP" + (idx + 1).toString(),
        type: ActivityType.Watching,
        state: "J'adore cet épisode !",
        weight: 1
      }
    return [...acc, element];
  }, []);
  activityList.push(...EwilanList);
  
  return activityList;
}


/**
 * Set the timeout for bot activity update.
 * @param {Object} client The bot Client.
 */
export const updateActivity = (client) => {
  // set random waiting time for updating Ewibot activity

  const waitingTime = (4 * Math.random() + 4) * 3600 * 1000; //random between 4 and 8 hrs
  setTimeout(() => {
    setActivity(client);
    updateActivity(client);
  }, waitingTime);
};

const getActivityIndexes = (activities) => {
  const indexes = activities.reduce((acc, cur, idx) => {
    const w = cur.weight ? cur.weight : 2;
    const array = Array.from(Array(w), (e) => e = idx);
    return [...acc, ...array];
  }, [])
  return indexes;
};

/**
 * Set the bot client activity with a random choice from activityList.
 * @param {Object} client The bot Client.
 */
export const setActivity = (client) => {
  // randomise Ewibot activity
  const activityList = buildActivityList();
  const indexes = getActivityIndexes(activityList);
  const rdmIdx = Math.round(indexes.length * Math.random());
  const whichStatus = activityList[indexes[rdmIdx]];

  //set client activity
  client.user.setActivity(whichStatus);
};

//#endregion

//#region readContentAndReact
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

  if (isIgnoredUser(db, authorId) || isIgnoredChannel(db, message.channel.id))
    return; //check for ignore users or channels

  const sanitizedContent = removePunctuation(loweredContent); //remove punctuation

  // If message contains apology, Ewibot reacts
  if (hasApology(sanitizedContent)) {
    addApologyCount(db, authorId); //add data to db
    await message.react(currentServer.panDuomReactId); //add message reaction
  }

  const words = loweredContent.split(" "); //split message content into a list of words

  if (isAbcd(words)) await message.react(currentServer.eyeReactId);

  //if ewibot is mentionned, react
  if (message.mentions.has(process.env.CLIENTID))
    await message.react(currentServer.rudolphslichId);

  const frequency = Math.random() > 0.9; // Limit Ewibot react frequency

  //Ewibot wave to user
  if (hello.some((helloMessage) => words[0] === helloMessage) && frequency) {
    await message.react(cmnShared.helloEmoji);
  }
  if (
    hello.some((helloMessage) => words[0] === helloMessage) || //words
    words[0] === cmnShared.helloEmoji //wave emote
  ) {
    if (addStatsData(db, authorId, "hello") === dbReturnType.isNotOk)
      console.log(
        `addStatsData isNotOk with isStatsUser ${isStatsUser(
          db,
          authorId,
        )}, userID ${authorId}, whichStat "hello"`,
      );
    if (frequency) {
      if (words[0].includes("coucou")) await message.react(cmnShared.birdEmoji);
      else await message.react(cmnShared.helloEmoji);
    }
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
    if (foundEmotes.length > 0 && frequency)
      reactToContentEmotes(message, currentServer, today, foundEmotes);
  }

  // If users say they are hungry
  if (isHungry(loweredContent)) {
    const reaction = Object.values(currentServer.hungryEmotes);
    const random = Math.round(Math.random()); // 0 or 1
    if (frequency) message.react(reaction[random]);

    if (isStatsUser(db, authorId)) addStatsData(db, authorId, statsKeys.hungry); //add to db
  }

  if (authorId === cmnShared.LuciferId && isLuciferAge(sanitizedContent))
    await message.react(currentServer.panDuomReactId); //add message reaction
};

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
      { latestUnicode: null, isAbcd: true },
    );
    return reduced.isAbcd;
  }
  return false;
};

const isHungry = (loweredContent) => {
  return loweredContent.includes("faim");
};

const isLuciferAge = (content) => {
  const presqueRegex = new RegExp(/pres(qu|k)e *(19|dix( |-)*neuf)/gim); //regex for presque 19 detection
  const presqueResult = presqueRegex.exec(content); //check if contains presque 19

  presqueRegex.lastIndex = 0; //reset lastIndex, needed for every check
  return presqueResult !== null;
};

const reactToContentEmotes = async (message, server, today, foundEmotes) => {
  if (today.getMonth() == 5)
    await message.react("🏳️‍🌈"); //PRIDE MONTH, RAINBOWSSSSS
  else if (today.getMonth() == 11)
    await message.react(server.rudolphslichId); //December
  else if (today.getMonth() === 0 && today.getDate() === 1)
    message.react("🎂"); //ewibot birthday
  else
    for (const e of foundEmotes) {
      if (Math.random() > 0.5) await message.react(e);
    }
};

//#endregion
