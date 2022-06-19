import { MessageEmbed } from "discord.js";

export const fetchAuditLog = async (guild, auditType) => {
  //fetch the first corresponding audit log
  const fetchedLogs = await guild.fetchAuditLogs({
    limit: 1,
    type: auditType,
  }); //fetch logs
  return fetchedLogs.entries.first(); //return the first
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
      await logChannel.send({ embeds: embed }); //send
      if (attachments) await logChannel.send({ files: attachments }); //if attachments, send new message
    } catch {
      console.log("finishEmbed error\n", personalityEvent.title, embed);
    }
    return;
  }

  if (personalityEvent.executor)
    embed.addField(personalityEvent.executor, executor, true);
  if (text) embed.addField(personalityEvent.text, text, false); //if any text (reason or content), add it

  try {
    await logChannel.send({ embeds: [embed] }); //send
    if (attachments) await logChannel.send({ files: attachments }); //if attachments, send new message
  } catch {
    console.log(personalityEvent.title, embed);
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
    embed.addField(personality.author, object.tag, true);
  } else if (type === "skip") return embed;
  else embed.addField(personality.author, object.name, true); //otherwise, add the object name (for channels, roles, ...)
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
    .slice(); //sort channels with oldPosition

  //regroup channels w/ same parent
  const regrouped = parentIdOrder.reduce((acc, cur) => {
    //regroup according to parentId
    console.log("acc", acc, "cur" , cur);
    const list = acc.list; //get list
    const len = list.length; //get list length
    const lastParentId = acc.lastParentId; //get lastParentId
    if (lastParentId === cur.parentId && cur.parentId !== null) {
      //regroup
      list[acc.lastAddIdx].push(cur);
      return { list: list, lastParentId: lastParentId, lastAddIdx: acc.lastAddIdx}
    } else if (lastParentId !== cur.parentId && cur.parentId !== null) {
      //new to place correctly
      const parentsIds = list.map((obj) => obj[0].id); //get all parent ids
      const parentIdx = parentsIds.findIndex((id) => cur.parentId === id); //find parent index in list
      if (parentIdx === -1) {
        //no parent => new goup alone
        return { list: [...list, [cur]], lastParentId: cur.parentId, lastAddIdx: len };
      }
      //has parent
      console.log("parentIdx", parentIdx, len - 1)
      parentIdx === len-1 ? list.push([cur]) : list.splice(parentIdx + 1, 0, [cur]); //insert [cur]
      console.log("splice", list)
      return { list: list, lastParentId: cur.parentId, lastAddIdx: parentIdx + 1};
    }
    //is parent
    return { list: [...list, [cur]], lastParentId: cur.parentId, lastAddIdx: len };
  }, { list: [], lastParentId: null, lastAddIdx: 0 }); //{list: [[{id, name, parentId, oldPos, newPos}, ...],], lastParentId
  console.log("regroup", regrouped.list);

  //create old/new channel order
  //console.log("channels", channels);
  const oldOrder = channels.sort((a, b) => a.oldPos - b.oldPos).slice(); //sort channels with oldPosition
  const newOrder = channels.sort((a, b) => a.newPos - b.newPos).slice(); //slice() for variable shallow copy

  //write text for embed
  const space = 15;
  const orderText = oldOrder.reduce((acc, cur, idx) => {
    const newObj = newOrder[idx];

    //if not standard ascii value (ie. is emote), remove it
    const oldName = removeEmote(cur.name);
    const newName = removeEmote(newObj.name);

    //if has parentId, indent text
    const oldIndent = cur.parentId ? `  ${oldName}` : oldName;
    const newIndent = newObj.parentId ? `  ${newName}` : newName;

    //create log line
    const spaced = space2Strings(oldIndent, newIndent, space, " | ");
    if (idx === oldOrder.length - 1) {
      //if last one
      return acc + "\n" + spaced + "\n```"; //add end of code line code
    }
    return acc + "\n" + spaced;
  }, "```md\n" + space2Strings("avant", "apres", space, " | ") + "\n");

  finishEmbed(chnUp, logPerso.noLog, embed, logChannel, orderText); //send embed

  client.channelUpdate = {}; //remove from client
};

const space2Strings = (str1, str2, dist, sep) => {
  //slice 2 strings, pad the end + add a separator
  const sliced1 = str1.slice(0, dist).padEnd(dist, " ");
  const sliced2 = str2.slice(0, dist).padEnd(dist, " ");

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
