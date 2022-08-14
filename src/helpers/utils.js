import {
  isIgnoredUser,
  isIgnoredChannel,
  addEmoteCount,
  removeEmoteCount,
  addStatData,
} from "./index.js";

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
  console.log("emoteIds", emoteIds);

  const words = message.content.split(" "); //get words

  const onlyEmotes = words.reduce((acc, cur) => {
    //get only ids of emote from server
    if (cur.includes("<:")) {
      //if emote
      const parsed = cur.slice(2, -1).split(":"); //[name, id]
      const id = parsed[1]; //get id
      if (emoteIds.includes(id)) return [...acc, id]; //if server emote, return id
    } else return acc;
  }, []);

  const sortedEmotes = onlyEmotes.sort((a, b) => a - b); //sort by ids
  console.log("wordEmojiDetection sortedEmotes", sortedEmotes);
  return sortedEmotes;
};

export const reactionHandler = async (message, currentServer, client) => {
  const db = client.db;
  const authorId = message.author.id;

  if (isIgnoredUser(authorId, db) || isIgnoredChannel(db, message.channel.id))
    return; //check for ignore users or channels

  // If message contains apology, Ewibot reacts
  const loweredContent = message.content.toLowerCase(); //get text in Lower Case
  const sanitizedContent = sanitizePunctuation(loweredContent); //remove punctuation

  if (hasApology(sanitizedContent)) {
    addStatData(authorId, db, "apology"); //add data to db
    await message.react(currentServer.panDuomReactId); //add message reaction
  }

  const words = loweredContent.split(" ");
  if (isAbcd(words)) await message.react(currentServer.eyeReactId);

  console.log("words", words);

  //handle emoji stats
  const foundEmotes = wordEmojiDetection(message, client);
  if (foundEmotes.length !== 0)
    foundEmotes.forEach((emoteId) => emojiStat(emoteId, message.author, "add"));

  const frequency = Math.random() > 0.8; // Limit Ewibot react frequency

  //Ewibot wave to user
  if (hello.some((helloMessage) => words[0] === helloMessage) && frequency) {
    await message.react(currentServer.helloEmoji);
  }

  // Ewibot reacts with the same emojis that are inside the message
  const emotes = Object.values(currentServer.autoEmotes);
  const today = new Date();

  for (const word of words) {
    const foundEmotes = emotes.filter((emote) => word.includes(emote)); // If the emoji is in the commons.json file
    if (foundEmotes.length > 0 && frequency) {
      // PRIDE MONTH, RAIBOWSSSSS
      if (today.getMonth() == 5) {
        await message.react("🏳️‍🌈");
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

    addStatData(authorId, db, "hungry"); //add to db
    if (frequency) message.react(reaction[random]);
  }

  if (authorId === currentServer.LuciferId) {
    //if Lucifer
    const presqueRegex = new RegExp(/pres(qu|k)e *(15|quinze)/gim); //regex for presque 15 detection
    const presqueResult = presqueRegex.exec(sanitizedContent); //check if contains presque 15

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
