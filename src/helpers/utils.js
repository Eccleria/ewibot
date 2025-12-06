import dayjs from "dayjs";
import { EmbedBuilder, MessageFlags } from "discord.js";
import { COMMONS } from "../commons.js";

/**
 * Types imports for docstrings
 * @import { Channel, ChannelManager, Interaction, Message, MessageManager, MessagePayload } from "discord.js"
 */

//#region API wrappers

/**
 *
 * @param {Channel} channel Channel where to send the message.
 * @param {object} payload Payload of the message.
 * @returns {Promise<Message>} Message sent on channel
 */
export const channelSend = async (channel, payload) => {
  const message = await channel.send(payload).catch((e) => console.error(e));
  return message;
};

/**
 * Fetch a channel from a ChannelManger and catch issues
 * @param {ChannelManager} channels The channelManager to fetch the channel from.
 * @param {string} id The Id of the channel to fetch
 * @returns {Promise<Channel>}
 */
export const fetchChannel = async (channels, id) => {
  const channel = await channels.fetch(id).catch(console.err);
  return channel;
}

/**
 * Fetch the guild from its id
 * @param {Client} client Bot client
 * @param {string} guildId The id of the guild to fetch
 * @returns {Promise<Guild>}
 */
export const fetchGuild = async (client, guildId) => {
  return await client.guilds.fetch(guildId).catch(console.error);
};

/**
 * Fetch a message from its id using a MessageManager
 * @param {MessageManager} messageManager The manager to fetch the message from
 * @param {string} messageId The id of the message to fetch
 * @returns {Promise<Message>}
 */
export const fetchMessage = async (messageManager, messageId) => {
  return await messageManager.fetch(messageId).catch(console.error);
}

/**
 * Reply to interaction function
 * @param {Interaction} interaction Interaction the function is replying to.
 * @param {string|object} data Data of the replying message.
 * @param {boolean} [isEphemeral] Add the Ephemeral flag to message flags, true by default.
 */
export const interactionReply = async (
  interaction,
  data,
  isEphemeral = true,
) => {
  const payload = typeof data === "string" ? { content: data } : data;
  if (isEphemeral) payload.flags = MessageFlags.Ephemeral;

  await interaction
    .reply(payload)
    .catch((err) => console.log("interactionReply error", err));
};

/**
 * Wrapper that handle Message.reply and its catch
 * @param {Message} message A Discord message object
 * @param {MessagePayload} payload The content to reply with
 */
export const messageReply = async (message, payload) => {
  return await message
    .reply(payload)
    .catch((err) => console.error("message reply error", err));
};

//#endregion


/**
 * Get strings corresponding to gif url.
 * @param {string} content
 * @returns {?string[]} If any, returns array of gif url strings.
 */
export const gifRecovery = (content) => {
  const tenor = "tenor.com/";
  const end = ".gif";

  if (content.includes(tenor) || content.includes(end)) {
    //if any gif inside content
    const words = content.split(/( |\n)/gm); //split content into words
    const results = words.reduce((acc, cur) => {
      //look for gif position in content
      if (cur.includes(tenor) || cur.endsWith(end)) {
        //if has link
        const start = cur.indexOf("https://"); //look for link position
        const sliced = start !== -1 ? cur.slice(start) : cur; //slice start of link
        return [...acc, sliced]; //return link
      }
      return acc;
    }, []);
    return results;
  }
  return null;
};

const apologyRegex = new RegExp( //regex for apology detection
  /(d[ée]*[sz]ol*[eé]*[sr]?)|(dsl[eé]*)|(so?r+y)|(pardo+n+)|(navr[eé]+)|(excuse[zs]*)/gm,
);

export const hasApology = (sanitizedContent) => {
  let apologyResult = apologyRegex.exec(sanitizedContent); //check if contains apology
  if (process.env.DEBUGLOGS === "yes")
    console.log("apologyResult", apologyResult);

  apologyRegex.lastIndex = 0; //reset lastIndex, needed for every check
  while (apologyResult !== null) {
    //if found apology
    const splited = sanitizedContent.split(" "); //split words
    const idx = apologyResult.index;

    if (process.env.DEBUGLOGS === "yes")
      console.log("splited.length", splited.length, "apologyResult.index", idx);

    const result = splited.reduce(
      (acc, cur) => {
        const newLen = acc.len + cur.length + 1;
        if (process.env.DEBUGLOGS === "yes") {
          console.log("len", acc.len, "newLen", newLen, "cur", [cur]);
          console.log(cur.length, sanitizedContent[newLen], "word", acc.word);
        }
        if (acc.len <= idx && idx < newLen) {
          if (process.env.DEBUGLOGS === "yes") console.log("found");
          return { word: acc.word || cur, len: newLen, nb: acc.nb + 1 };
        } else return { word: acc.word, len: newLen, nb: acc.nb };
      },
      { word: null, len: 0, nb: 0 },
    );
    const wordFound = result.word;

    if (process.env.DEBUGLOGS === "yes") console.log("wordFound", [wordFound]);

    //verify correspondance between trigerring & full word for error mitigation
    if (apologyResult[0] === wordFound) return true;

    //compute for next while
    apologyResult = apologyRegex.exec(sanitizedContent); //check if contains apology
  }
  return false;
};

export const isAdmin = (authorId) => {
  // Check if is admin users
  const admins = COMMONS.getShared().admins;
  return admins.includes(authorId);
};

/**
 * Return if command has been released or not
 * @param {object} command
 * @returns {boolean}
 */
export const isReleasedCommand = (command) => {
  const day = dayjs();
  if (command.releaseDate) return command.releaseDate.diff(day) <= 0;
  else return true;
};

/**
 * Return if guildMember has Sentinelle role or not
 * @param {any} member guildMember to verify role
 * @param {any} currentServer current server data from commons.json
 * @returns {boolean}
 */
export const isSentinelle = (member, currentServer) => {
  const roles = member.roles.cache;
  return roles.has(currentServer.sentinelleRoleId);
};

/**
 * Parse a string emoji into its id.
 * @param {string} content `<a:name:id>`, `<:name:id>`, `a:name:id` or `name:id` emoji identifier string
 * @returns {?string} Emoji id | null
 */
export const parseEmoji = (content) => {
  //id is always last of content.split(":")
  if (!content.includes(":")) return null;

  const splited = content.split(":");
  const sliced = splited[splited.length - 1];
  if (sliced.includes(">")) {
    const id = sliced.split(">")[0];
    return id;
  }
  return sliced;
};

/**
 * Remove starting emote from a string
 * @param {string} str String to modify
 * @returns {string} New string sliced without emote
 */
export const removeEmote = (str) => {
  //remove emote from the begining of a string
  const ascii = str[0].charCodeAt(0);
  if (ascii > 255) return str.slice(str[0].length); //if not a standard char => emote
  return str;
};

const punctuation = new RegExp(/[!"#$%&'()*+,\-.:;<=>?@[\]^_`{|}~…]/gm);
export const removePunctuation = (messageContent) => {
  const lineBreakRemoved = replaceLineBreak(messageContent, " ");
  return lineBreakRemoved.replaceAll(punctuation, "");
};

/**
 * Replce all \n with a replace string
 * @param {*} words list of words
 * @param {*} replace string that will replace lin breaks
 * @returns
 */
export const replaceLineBreak = (words, replace) => {
  return words.replaceAll("\n", replace);
};

/**
 * Create and setup a EmbedBuilder with common properties.
 * @param {string} color The color of the embed.
 * @param {object} personality The personality object of the embed.
 * @param {?object} object Object containing or not the author.
 * @param {?string} type Differentiate object use case.
 *                       tag for user as embed, skip to ignore this field, user for its username,
 *                       otherwise for mentionable as embed
 * @returns {EmbedBuilder} Embed with basic properties.
 */
export const setupEmbed = (color, personality, object, type) => {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(personality.title)
    .setTimestamp();

  if (personality.description) embed.setDescription(personality.description);

  const field = { name: personality.author, inline: true }; //field init
  if (type === "tag") {
    //add user as embed if required
    field.value = object.toString();
    embed.addFields(field);
  } else if (type === "skip")
    return embed; //allows to skip the 3rd field
  else if (type === "user") {
    //add user if required
    field.value = object.username;
    embed.addFields(field);
  } else {
    //otherwise, add the object name as embed (for mentionables)
    field.value = object.name.toString();
    embed.addFields(field);
  }
  return embed;
};

//TODO: add it to reminder
/**
 * Parse unix timestamp into dynamic Discord embed timestamp
 * @param {string} time Unix timestamp
 * @param {string} type Dynamic type. Default "R"
 * @returns {string}
 */
export const parseUnixTimestamp = (time, type = "R") => {
  return `<t:${time}:${type}>`;
};
