import dayjs from "dayjs";
import { EmbedBuilder } from "discord.js";
import { COMMONS } from "../commons.js";

/**
 * Slice a string len times and returns it as an array
 * @param {number} len Length of the returned array
 * @param {string} content Embed content to slice
 * @returns {string[]} Array of sliced content
 */
const sliceEmbedContent = (len, content) => {
  const lenArray = Array.from(new Array(len));
  const sliced = lenArray.reduce((acc, _cur, idx) => {
    if (idx === len - 1) return [...acc, content.slice(idx * 1024)]; //last index
    const sliced = content.slice(idx * 1024, (idx + 1) * 1024);
    return [...acc, sliced];
  }, []); //slice content in less than 1024 characters
  return sliced;
};

/**
 * Slice content if required then add it to the embed
 * @param {string} content Old Content from previous embed to slice
 * @param {object} embed New embed that will have sliced content
 * @param {object} personality The personality object of the embed.
 */
export const checkEmbedContent = (content, embed, personality) => {
  const slice = Math.ceil(content.length / 1024); //get number of time to slice oldContent by 1024

  if (slice > 1) {
    //if need to slice
    const sliced = sliceEmbedContent(slice, content); //slice content

    //add content to embed, according to its index
    sliced.forEach((str, idx) => {
      if (idx === 0)
        embed.addFields({
          name: personality.text,
          value: str,
        });
      //name's different from others
      else embed.addFields({ name: personality.textAgain, value: str });
    });
  } else embed.addFields({ name: personality.text, value: content });
};

/**
 * Fetch Log Channel using commons value
 * @param {object} eventObject Object given by listener event.
 * @param {string} [type] String to ditinguish which channel/thread to return. Can be "thread" or "inAndOut" channel. Null is for log channel.
 * @returns {TextChannel}
 */
export const fetchLogChannel = async (eventObject, type) => {
  const currentServer = COMMONS.fetchFromGuildId(eventObject.guild.id); //get server local data

  let id;
  switch (type) {
    case "thread":
      id = currentServer.logThreadId;
      break;
    case "inAndOut":
      id = currentServer.inAndOutLogChannelId;
      break;
    default:
      id = currentServer.logChannelId;
  }

  return await eventObject.guild.channels.fetch(id); //return the log channel
};

/**
 * Get strings corresponding to gif url.
 * @param {string} content Message content where to look for gifs.
 * @returns {?string[]} If any, returns array of gif url strings.
 */
export const gifParser = (content) => {
  const tenor = "tenor.com/";
  const end = ".gif";

  if (content.includes(tenor) || content.includes(end)) {
    //if any gif inside content
    const words = content.split(" "); //split content into words
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
  /(d[ée]*[sz]ol*[eé]*[sr]?)|(dsl[eé]*)|(so?r+y)|(pardo+n+)|(navr[eé]+)|(excuse[zs]*)/gm
);

export const hasApology = (sanitizedContent) => {
  const apologyResult = apologyRegex.exec(sanitizedContent); //check if contains apology
  if (process.env.DEBUGLOGS === "yes")
    console.log("apologyResult", apologyResult);

  apologyRegex.lastIndex = 0; //reset lastIndex, needed for every check
  if (apologyResult !== null) {
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
      { word: null, len: 0, nb: 0 }
    );
    const wordFound = result.word;

    if (process.env.DEBUGLOGS === "yes") console.log("wordFound", [wordFound]);

    //verify correspondance between trigerring & full word for error mitigation
    if (apologyResult[0] === wordFound) return true;
  }
  return false;
};

export const hasOctagonalSign = (content, cmnShared) => {
  return content.includes(cmnShared.octagonalSignEmoji);
};

/**
 * Reply to interaction function
 * @param {any} interaction Interaction the function is replying to.
 * @param {string} content Content of the replying message.
 * @param {boolean} [isEphemeral] Send *ephemeral or not* message, true by default.
 */
export const interactionReply = async (
  interaction,
  content,
  isEphemeral = true
) => {
  await interaction
    .reply({ content: content, ephemeral: isEphemeral })
    .catch((err) => console.log("interactionReply error", err));
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
  const lineBreakRemoved = messageContent.replaceAll("\n", " ");
  return lineBreakRemoved.replaceAll(punctuation, "");
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
  } else if (type === "skip") return embed; //allows to skip the 3rd field
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

/**
 * Parse unix timestamp into dynamic Discord embed timestamp
 * @param {string} time Unix timestamp
 * @param {string} type Dynamic type. Default "R"
 * @returns {string}
 */
export const parseUnixTimestamp = (time, type = "R") => {
  return `<t:${time}:${type}>`;
};
