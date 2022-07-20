import { MessageEmbed } from "discord.js";

// jsons import
import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("static/commons.json"));


/**
 * Fetch AuditLog from API.
 * @param {Guild} guild Guild.
 * @param {string} auditType String for audit type request.
 * @returns {GuildAuditLogsEntry|null} Returns first auditLog entry or null if error.
 */
export const fetchAuditLog = async (guild, auditType) => {
  try {
    const fetchedLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: auditType,
    }); //fetch logs
    return fetchedLogs.entries.first(); //return the first
  } catch (e) {
    //if no permission => crash
    console.log("AuditLog Fetch Error", e);
    return null;
  }
};

/**
 * Create and setup a MessageEmbed with common properties.
 * @param {string} color The color of the embed.
 * @param {object} personality The personality object of the embed.
 * @param {object} [object] Object containing or not the author.
 * @param {string} [type] Differentiate object use case.
 * @returns {MessageEmbed} Embed with basic properties.
 */
export const setupEmbed = (color, personality, object, type) => {
  const embed = new MessageEmbed()
    .setColor(color)
    .setTitle(personality.title)
    .setTimestamp();

  if (personality.description) embed.setDescription(personality.description);

  if (type === "tag") embed.addField(personality.author, object.toString(), true); //add user as embed if required
  else if (type === "skip") return embed; //allows to skip the 3rd field
  else embed.addField(personality.author, object.name.toString(), true); //otherwise, add the object name as embed (for channels, roles, ...)
  return embed;
};

/**
 * Finish embeds and send them in the logChannel.
 * @param {object} personalityEvent The personality related to the triggered event.
 * @param {object} [executor] Object containing or not the executor, if any.
 * @param {(MessageEmbed|MessageEmbed[])} embed Log embed, or array of embeds with log at index 0.
 * @param {TextChannel} logChannel Log channel where to send embed.s.
 * @param {string} [text] Additional text to add.
 * @param {Attachment[]} [attachments] Message attachments.
 */
export const finishEmbed = async (
  personalityEvent,
  executor,
  embed,
  logChannel,
  text,
  attachments
) => {
  const currentServer = commons.find(
    ({ name }) => name === "test"
  ); //get test data

  if (process.env.DEBUG === "no" && logChannel.guildId === currentServer.guildId) {
    //Ewibot detects test in test server => return
    console.log("Ewibot log in Test server", personalityEvent.title);
    return;
  }
  if (embed.author !== null) {
    //embed.author is a embed property & not an array property
    //if contains multiple embeds, the 1st is the log
    if (personalityEvent.executor && executor !== null)
      embed[0].addField(personalityEvent.executor, executor.toString(), true); //add the executor section
    if (text) embed[0].addField(personalityEvent.text, text, false); //if any text (reason or content), add it

    try {
      await logChannel.send({ embeds: embed, allowed_mentions: { parse: [] } }); //send
      if (attachments && attachments.length !== 0)
        await logChannel.send({ files: attachments }); //if attachments, send new message
    } catch (e) {
      console.log(
        "finishEmbed list error\n",
        personalityEvent.title,
        new Date(),
        e,
        embed
      );
    }
    return;
  }

  if (personalityEvent.executor && executor !== null)
    embed.addField(personalityEvent.executor, executor.toString(), true);
  if (text) embed.addField(personalityEvent.text, text, false); //if any text (reason or content), add it

  try {
    await logChannel.send({ embeds: [embed], allowed_mentions: { parse: [] } }); //send
    if (attachments && attachments.length !== 0)
      await logChannel.send({ files: attachments }); //if attachments, send new message
  } catch (e) {
    console.log("finishEmbed error\n", personalityEvent.title, e, embed);
  }
};

/**
 * Differentiate finishEmbed cases.
 * @param {object} object Object related to listened event.
 * @param {GuildAuditLogsEntry} log Audit log.
 * @param {object} eventPerso Personality related to the listened event.
 * @param {object} logPerso Audit log personality.
 * @param {(MessageEmbed|MessageEmbed[])} embed Embed, or array of embeds with log at index 0.
 * @param {TextChannel} logChannel Log channel where to send embed.s.
 * @param {string} [text] Text to add when finishing the embed.
 * @param {number} [diff] Timing difference between log and listener fire. If diff >= 5 log too old.
 */
export const endAdmin = (
  object,
  log,
  eventPerso,
  logPerso,
  embed,
  logChannel,
  text,
  diff
) => {
  if (diff >= 5) {
    //if log too old
    finishEmbed(eventPerso, logPerso.tooOld, embed, logChannel);
    return;
  }

  if (!log) {
    //if no AuditLog
    finishEmbed(eventPerso, logPerso.noLog, embed, logChannel, text);
    return;
  }

  const { executor, target } = log;

  if (target.id === object.id) {
    //check if log report the correct kick
    finishEmbed(eventPerso, executor, embed, logChannel, text);
  } else {
    //if bot or author executed the kick
    finishEmbed(eventPerso, logPerso.noExec, embed, logChannel, text);
  }
};

/**
 * Fetch Log Channel.
 * @param {object} commons commons.json file value.
 * @param {object} eventObject Object given by listener event.
 * @param {string} type String to ditinguish if returns channel or thread
 * @returns {TextChannel}
 */
export const getLogChannel = async (commons, eventObject, type) => {
  const currentServer = commons.find(
    ({ guildId }) => guildId === eventObject.guild.id
  ); //get server local data
  const id = type === "thread" ? currentServer.logThreadId : currentServer.logChannelId
  return await eventObject.guild.channels.fetch(id); //return the log channel
};

export const clientEventUpdateProcess = (
  client,
  oldObj,
  newObj,
  personality,
  logPerso,
  logChannel,
  embed,
  type
) => {
  //create timeout, store channels & timeout
  //differentiate type
  let obj;
  let newData;
  let timeout;
  if (type === "channel") {
    //get client data
    const channelUpdate = client.channelUpdate;
    obj = channelUpdate ? channelUpdate.channels : null;

    //create timeout
    timeout = setTimeout(
      channelUpdateLog,
      5000,
      client,
      personality,
      logPerso,
      logChannel,
      embed
    );

    //setup new data
    newData = {
      id: newObj.id,
      name: oldObj.name,
      parentId: newObj.parentId,
    };
  } else if (type === "role") {
    const roleUpdate = client.roleUpdate;
    obj = roleUpdate ? roleUpdate.roles : null; //get data

    //create timeout
    timeout = setTimeout(
      roleUpdateLog,
      5000,
      client,
      personality,
      logPerso,
      logChannel,
      embed
    );

    newData = { id: newObj.id, name: oldObj.name };
  }

  //initialise data to add to client
  let updateData;

  //check for identical obj
  if (obj !== null && obj !== undefined) {
    const names = obj.map((obj) => obj.name); //get all obj names
    const index = names.findIndex((name) => name === oldObj.name); //find any doublon
    if (index !== -1) {
      //if any doublon
      const precedent = obj[index]; //get precedent
      newData.oldPos = precedent.oldPos; //keep precedent oldPosition
      newData.newPos = newObj.rawPosition; //update newPosition

      //remove doublon
      const filtered = obj.filter((_obj, idx) => idx !== index);
      if (type === "channel")
        updateData = { channels: [...filtered, newData], timeout: timeout };
      else if (type === "role")
        updateData = { roles: [...filtered, newData], timeout: timeout };
    } else {
      //if no doublon
      newData.oldPos = oldObj.rawPosition;
      newData.newPos = newObj.rawPosition;
      if (type === "channel")
        updateData = { channels: [...obj, newData], timeout: timeout };
      else if (type === "role")
        updateData = { roles: [...obj, newData], timeout: timeout };
    }
    //store in client
    if (type === "channel") client.channelUpdate = updateData;
    else if (type === "role") client.roleUpdate = updateData;
  } else {
    //client not initialised or channels changes are too quick for client
    newData.oldPos = oldObj.rawPosition;
    newData.newPos = newObj.rawPosition;
    if (type === "channel") {
      updateData = { channels: [newData], timeout: timeout };
      client.channelUpdate = updateData;
    } else if (type === "role") {
      updateData = { roles: [newData], timeout: timeout };
      client.roleUpdate = updateData;
    }
  }
};

const channelUpdateLog = async (client, chnUp, logPerso, logChannel, embed) => {
  //Function called after channelUpdate timeout end
  //client == {channels: [data], timeout: timeout}
  //data == {id, name, parentId, oldPos, newPos}

  const { channels } = client.channelUpdate;

  //sort by parentId
  const parentIdOrder = channels
    .sort((a, b) => a.parentId - b.parentId)
    .slice(); //sort channels with parentId

  //regroup channels w/ same parent && sort parent channels
  const oRegrouped = regroup(parentIdOrder, "oldPos");
  const nRegrouped = regroup(parentIdOrder);

  //create old/new channel order
  //console.log("oRegrouped.list", oRegrouped.list, "nRegrouped.list", nRegrouped.list);
  const oldOrder = oRegrouped.list.reduce((acc, cur) => {
    if (cur.length && cur.length > 1)
      return [...acc, cur.sort((a, b) => a.oldPos - b.oldPos).slice()];
    return [...acc, cur];
  }, []); //sort channels with oldPosition
  const newOrder = nRegrouped.list.reduce((acc, cur) => {
    if (cur.length && cur.length > 1)
      return [...acc, cur.sort((a, b) => a.newPos - b.newPos).slice()];
    return [...acc, cur];
  }, []); //slice() for variable shallow copy

  //write text for embed
  const oLen = oldOrder.length;
  //console.log("oldOrder", oldOrder)
  const oText = oldOrder.reduce((acc, cur, idx) => {
    //cur = [x*{name, id, parent, old, new}]
    //write text for futur concatenation
    const len = cur.length;
    const lenNext = idx < oLen - 1 ? oldOrder[idx + 1].length : null;
    const sep = lenNext !== null && lenNext !== 1 && len !== 1 ? `\n` : null;

    const text = cur.reduce((acc, cur) => {
      //get text from list
      const name = removeEmote(cur.name); //remove the emote if any
      const indent = cur.parentId ? `  ${name}` : name; //if has parent, ident
      return [...acc, `\n${indent}`];
    }, []);
    if (sep !== null) return [...acc, ...text, sep];
    return [...acc, ...text];
  }, []);

  const nText = newOrder.reduce((acc, cur, idx) => {
    //write text for futur concatenation
    //check length for separation
    const len = cur.length;
    const lenNext = idx < oLen - 1 ? oldOrder[idx + 1].length : null;
    const sep = lenNext !== null && lenNext !== 1 && len !== 1 ? ` ` : null;
    const text = cur.reduce((acc, cur) => {
      //get text from list
      const name = removeEmote(cur.name); //remove the emote if any
      const indent = cur.parentId ? `  ${name}` : name; //if has parent, ident
      return [...acc, indent];
    }, []);
    if (sep !== null) return [...acc, ...text, sep];
    return [...acc, ...text];
  }, []);

  const space = 15;
  //console.log("oText", [oText])
  const orderText = oText.reduce((acc, cur, idx) => {
    //console.log("acc", [acc], "cur", [cur]);
    //console.log("cur", [cur], "nCur", [nText[idx]]);
    const spaced = space2Strings(cur, nText[idx], space, " |");
    //console.log("spaced", [spaced])
    if (idx === oText.length - 1) {
      //if last one
      return acc + spaced + "\n```"; //add end of code line code
    }
    return acc + spaced;
  }, "```md\n" + space2Strings("avant", "apres", space, " |") + "\n");

  finishEmbed(chnUp, logPerso.noLog, embed, logChannel, orderText); //send embed

  client.channelUpdate = {}; //remove from client
};

const roleUpdateLog = (client, roleUp, logPerso, logChannel, embed) => {
  //Function called after roleUpdate timeout end
  //client == {roles: [data], timeout: timeout}
  //data == {id, name, oldPos, newPos}
  const { roles } = client.roleUpdate;

  //create old/new channel order
  const oldOrder = roles.sort((a, b) => b.oldPos - a.oldPos).slice(); //sort channels with oldPosition
  const newOrder = roles.sort((a, b) => b.newPos - a.newPos).slice(); //slice() for variable shallow copy

  const space = 15;
  const orderText = oldOrder.reduce((acc, cur, idx) => {
    const spaced = space2Strings(cur.name, newOrder[idx].name, space, " |");
    if (idx === oldOrder.length - 1) {
      //if last one
      return acc + "\n" + spaced + "\n```"; //add end of code line code
    }
    return acc + "\n" + spaced;
  }, "```md\n" + space2Strings("avant", "apres", space, " |") + "\n");

  finishEmbed(roleUp, logPerso.noLog, embed, logChannel, orderText); //send embed

  client.roleUpdate = {}; //remove from client
};

const space2Strings = (str1, str2, dist, sep) => {
  //slice 2 strings, pad the end + add a separator
  const sliced1 = str1.startsWith("\n")
    ? str1.slice(0, dist + 1).padEnd(dist + 1, " ")
    : str1.slice(0, dist).padEnd(dist, " ");
  const sliced2 = str2.startsWith("\n")
    ? str2.slice(0, dist + 1).padEnd(dist + 1, " ")
    : str2.slice(0, dist).padEnd(dist, " ");

  return `${sliced1}${sep}${sliced2}`;
};

const removeEmote = (str) => {
  let n = 0;
  for (const char of str) {
    const ascii = char.charCodeAt(0);
    if (ascii > 255) n += char.length;
  }
  return str.slice(n);
};

const regroup = (element, type) => {
  return element.reduce(
    (acc, cur) => {
      //regroup according to parentId
      const list = acc.list; //get list
      const len = list.length; //get list length
      const lastParentId = acc.lastParentId; //get lastParentId
      if (lastParentId === cur.parentId && cur.parentId !== null) {
        //same parentId && not null : regroup
        list[acc.lastAddIdx].push(cur);
        return {
          list: list,
          lastParentId: lastParentId,
          lastAddIdx: acc.lastAddIdx,
        };
      } else if (lastParentId !== cur.parentId && cur.parentId !== null) {
        //new to place correctly :
        const parentsIds = list.map((obj) => obj[0].id); //get all parent ids
        const parentIdx = parentsIds.findIndex((id) => cur.parentId === id); //find parent index in list
        if (parentIdx === -1) {
          //no parent => new goup alone
          return {
            list: [...list, [cur]],
            lastParentId: cur.parentId,
            lastAddIdx: len,
          };
        }
        //has parent
        parentIdx === len - 1
          ? list.push([cur])
          : list.splice(parentIdx + 1, 0, [cur]); //insert [cur]
        return {
          list: list,
          lastParentId: cur.parentId,
          lastAddIdx: parentIdx + 1,
        };
      }
      //is a parent => sort with others
      const parents = list.reduce((acc, cur) => {
        if (cur.length === 1 && cur[0].parentId === null) {
          if (type === "oldPos") return [...acc, cur[0].oldPos];
          return [...acc, cur[0].newPos];
        }
        return [...acc, null]; //return null for index preservation
      }, []); //[id, [], id, id, [], id]...
      const parentIdx = parents.reduce((saved, now, indx) => {
        //if is number && id < idToAdd => save index
        const toCheck = type === "oldPos" ? cur.oldPos : cur.newPos;
        if (typeof now === "number" && toCheck > now) return indx + 1;
        return saved;
      }, 0); //find parent index in list
      list.splice(parentIdx, 0, [cur]);
      return { list: list, lastParentId: cur.parentId, lastAddIdx: len };
    },
    { list: [], lastParentId: null, lastAddIdx: 0 }
  ); //{list: [[{id, name, parentId, oldPos, newPos}, ...],], lastParentId
};

export const fetchMessage = async (message) => {
  try {
    return await message.fetch();
  } catch (e) {
    console.log(e);
    return null;
  }
};

/**
 * Get strings corresponding to gif url.
 * @param {string} content
 * @returns {?string[]} If any, returns array of gif url strings.
 */
export const gifRecovery = (content) => {
  const tenor = "tenor.com/";
  if (content.includes(tenor)) {
    const words = content.split(" ");
    const results = words.reduce((acc, cur) => {
      if (cur.includes(tenor)) return [...acc, cur]
      return acc;
    }, []);
    return results;
  }
  return null;
}
