import { MessageEmbed } from "discord.js";

export const fetchAuditLog = async (guild, auditType) => {
  //fetch the first corresponding audit log
  try {
    const fetchedLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: auditType,
    }); //fetch logs
    return fetchedLogs.entries.first(); //return the first
  } catch (e) {
    console.log("AuditLog Fetch Error", e);
    return null;
  }
};

export const finishEmbed = async (
  personalityEvent,
  executor,
  embed,
  logChannel,
  text,
  attachments
) => {
  //Finish the embed and send it
  if (embed.author !== null) {
    //embed.author is a embed property & not an array property
    //if contains multiple embeds, the 1st is the log
    if (personalityEvent.executor)
      embed[0].addField(personalityEvent.executor, executor, true); //add the executor section
    if (text) embed[0].addField(personalityEvent.text, text, false); //if any text (reason or content), add it

    try {
      await logChannel.send({ embeds: embed, allowed_mentions: { parse: [] } }); //send
      if (attachments && attachments.length !== 0)
        await logChannel.send({ files: attachments }); //if attachments, send new message
    } catch (e) {
      console.log("finishEmbed list error\n", personalityEvent.title, e, embed);
    }
    return;
  }

  if (personalityEvent.executor)
    embed.addField(personalityEvent.executor, executor, true);
  if (text) embed.addField(personalityEvent.text, text, false); //if any text (reason or content), add it

  try {
    await logChannel.send({ embeds: [embed], allowed_mentions: { parse: [] } }); //send
    if (attachments && attachments.length !== 0)
      await logChannel.send({ files: attachments }); //if attachments, send new message
  } catch (e) {
    console.log("finishEmbed error\n", personalityEvent.title, e, embed);
  }
};

export const getLogChannel = async (commons, eventObject) => {
  const currentServer = commons.find(
    ({ guildId }) => guildId === eventObject.guild.id
  ); //get server local data
  return await eventObject.guild.channels.fetch(currentServer.logChannelId); //return the log channel
};

export const setupEmbed = (color, personality, object, type) => {
  //setup the embed object
  const embed = new MessageEmbed()
    .setColor(color)
    .setTitle(personality.title)
    .setTimestamp();

  if (personality.description) embed.setDescription(personality.description);

  if (type === "tag") {
    //add the user tag if required
    embed.addField(personality.author, object.toString(), true);
  } else if (type === "skip") return embed;
  else embed.addField(personality.author, object.name.toString(), true); //otherwise, add the object name (for channels, roles, ...)
  return embed;
};

export const endAdmin = (
  object,
  log,
  eventPerso,
  logPerso,
  embed,
  logChannel,
  reason,
  diff
) => {
  if (diff >= 5) {
    //if log too old
    finishEmbed(eventPerso, logPerso.tooOld, embed, logChannel);
    return;
  }

  if (!log) {
    //if no AuditLog
    finishEmbed(eventPerso, logPerso.noLog, embed, logChannel, reason);
    return;
  }

  const { executor, target } = log;

  if (target.id === object.id) {
    //check if log report the correct kick
    finishEmbed(eventPerso, executor.tag, embed, logChannel, reason);
  } else {
    //if bot or author executed the kick
    finishEmbed(eventPerso, logPerso.noExec, embed, logChannel, reason);
  }
};

export const clientChannelUpdateProcess = (
  client,
  oldChannel,
  newChannel,
  chnUp,
  logPerso,
  logChannel,
  embed
) => {
  //create timeout, store channels & timeout
  const timeout = setTimeout(
    channelUpdateLog,
    5000,
    client,
    chnUp,
    logPerso,
    logChannel,
    embed
  ); //create timeout

  //handle client
  const channelUpdate = client.channelUpdate;
  const channels = channelUpdate ? channelUpdate.channels : null; //get data

  //initialise data to add to client
  let newData = {
    id: newChannel.id,
    name: oldChannel.name,
    parentId: newChannel.parentId,
  };
  let updateData;

  //check for identical channels
  if (channels !== null && channels !== undefined) {
    const names = channels.map((obj) => obj.name); //get all channels names
    const index = names.findIndex((name) => name === oldChannel.name); //find any doublon
    if (index !== -1) {
      //if any doublon
      const precedent = channels[index]; //get precedent
      newData.oldPos = precedent.oldPos; //keep precedent oldPosition
      newData.newPos = newChannel.rawPosition; //update newPosition

      //remove doublon
      const filtered = channels.filter((_obj, idx) => idx !== index);
      updateData = { channels: [...filtered, newData], timeout: timeout };
    } else {
      //if no doublon
      newData.oldPos = oldChannel.rawPosition;
      newData.newPos = newChannel.rawPosition;
      updateData = { channels: [...channels, newData], timeout: timeout };
    }
    client.channelUpdate = updateData; //store in client
  } else {
    //client not initialised or channels changes are too quick for client
    newData.oldPos = oldChannel.rawPosition;
    newData.newPos = newChannel.rawPosition;
    updateData = { channels: [newData], timeout: timeout };
    client.channelUpdate = updateData; //store in client
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
