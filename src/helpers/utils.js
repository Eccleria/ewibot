import { isIgnoredUser, addApologyCount, isIgnoredChannel } from "./index.js";
import commons from "../commons.json";


export const isCommand = (content) => content[0] === "$"; // check if is an Ewibot command

const apologyRegex = new RegExp(
  /(dsl)|(d[é|e]?sol?[e|é]*r?)|(so?r+y?)|(pardon)|(navr[e|é]*)/gm
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

const punctuation = new RegExp(/[_.?!,;:/-]/gm);

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
  if (loweredContent.includes("faim")) return true
};

export const reactionHandler = async (message, currentServer, client) => {
  const db = client.db;
  const authorId = message.author.id;

  if (isIgnoredUser(authorId, db) || isIgnoredChannel(db, message.channel.id))
    return; //check for ignore users or channels

  // If message contains apology, Ewibot reacts
  const loweredContent = message.content.toLowerCase();
  const sanitizedContent = sanitizePunctuation(loweredContent);
  const apologyResult = apologyRegex.exec(sanitizedContent);
  apologyRegex.lastIndex = 0;
  if (apologyResult !== null) {
    const wordFound = apologyResult.input
      .slice(apologyResult.index)
      .split(" ")[0];
    if (apologyResult[0] === wordFound) {
      addApologyCount(authorId, db);
      await message.react(currentServer.panDuomReactId);
    }
  }

  const words = loweredContent.split(" ");
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

  // If users say they are hungry
  if (isHungry(loweredContent)) {
    const reaction = Object.values(currentServer.hungryEmotes);
    const random = Math.round(Math.random()); // 0 or 1
    await message.react(reaction[random]);
  }
};

export const checkIsOnThread = async (channel, threadId) => {
  // If Ewibot not in the thread, add Ewibot
  const thread = channel.isThread
    ? null
    : channel.threads.cache.find((x) => x.id === threadId);
  if (thread && thread.joinable) await thread.join();
};

const PMfindEmotes = (channel, args) => {
  const position = args.indexOf("--emote"); //get --emote position
  if (position === -1) return [position, null]; //==-1 => not in args

  const currentServer = commons.find(
    //get emotes corresponding to the guild
    ({ guildId }) => guildId === channel.guild.id
  );

  const emotes = currentServer //get all usefull emotes
    ? [
      ...Object.entries(currentServer.ewilanEmotes),
      ...Object.entries(currentServer.autoEmotes),
    ]
    : null;

  if (emotes && args.length > position + 1) {
    //if correct server && enough args
    let foundEmotes = [];
    for (const word of args.slice(position + 1))
      foundEmotes = [
        ...foundEmotes,
        emotes.find((emote) => word.includes(emote[0])),
      ];

    return [position, foundEmotes]; //return --emote position + found emotes
  } else return [-1, []]; //if not correct serveer or not enough args
};

const PMContent = (channel, args) => {
  // prepare text to send
  let results = [0, []];
  if (args.includes("--emote")) results = PMfindEmotes(channel, args); //get --emote position + founded emotes

  const contentSliced =
    results[0] === 0 ? args.slice(2) : args.slice(2, results[0]); //get content + remove --emote
  const emotesToSend = results[1].map((emote) => emote[1]); // fetch emotes emote
  const content = [...contentSliced, ...emotesToSend].join(" "); // assemble text to send

  return content;
};

export const onPMChannel = async (client, message, args, attachments) => {
  //handling the channel function
  const destinationChannelId = args.length > 1 ? args[1] : null;
  try {
    const channel = await client.channels.fetch(destinationChannelId); //get the channel

    if (channel) {
      const content = PMContent(channel, args); //get the content to send

      channel.sendTyping(); //simulate Ewibot is writing
      setTimeout(() => {
        if (content.length > 0)
          //if content to send
          channel.send({
            content: content,
            files: attachments,
          });
        else channel.send({ files: attachments }); //if no content
      }, 3000);
    }
  } catch (e) {
    //channel not found
    console.log("catch PMChannel");
    message.reply("Exception");
  }
};

export const onPMReply = async (client, message, args, attachments) => {
  //handling the reply function
  const messageReplyId = args.length >= 2 ? args[1] : null; //get message to reply Id

  //Find channel and message
  const fetchIDs = client.channels.cache.map((element) => element.id); //get all channels ids from every guild
  let foundMessage = null;
  let foundChannel = null;
  for (let id of fetchIDs) {
    const channel = await client.channels.fetch(id);
    if (channel.type === "GUILD_TEXT") {
      try {
        foundMessage = await channel.messages.fetch(messageReplyId); //try to find the message in channel
        foundChannel = channel;
      } catch (e) {
        //if message not found => crash => catch
        //nothing to do
      }
    }
  }

  if (foundChannel && foundMessage) {
    const content = PMContent(foundChannel, args); //get the content to send

    foundChannel.sendTyping(); //simulate Ewibot is writing
    setTimeout(() => {
      if (content.length > 0)
        //if content to send
        foundMessage.reply({
          content: content,
          files: attachments,
        });
      else foundMessage.reply({ files: attachments }); //if no content
    }, 3000);
  } else { //if channel or message not found
    console.log("catch PMReply");
    message.reply(`Erreur, message non trouvé`);
  }
};