import { PERSONALITY } from "../personality.js";
import {
  fetchAuditLog,
  finishEmbed,
  getLogChannel,
  setupEmbed,
  endAdmin,
  //clientEventUpdateProcess,
  fetchMessage,
  //gifRecovery,
} from "./utils.js";
import {
  hasApology,
  sanitizePunctuation,
  addApologyCount,
  addMessageUpdateCount,
} from "../helpers/index.js"

//import dayjs from "dayjs";

// jsons imports
import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("./static/commons.json"));

export const onMessageUpdate = async (oldMessage, newMessage) => {
  //handle message update event

  let oMessage = oldMessage;
  let nMessage = newMessage;
  if (oldMessage.partial) {
    const message = await fetchMessage(oldMessage);
    oMessage = message === null ? oldMessage : message;
  }
  if (newMessage.partial) {
    const message = await fetchMessage(newMessage);
    nMessage = message === null ? newMessage : message;
  }

  if (!oMessage.guild) return; //Ignore DM

  //get personality
  const personality = PERSONALITY.getAdmin();
  const messageU = personality.messageUpdate;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, nMessage, "thread"); //get logChannel
  const date = oMessage.createdAt.toString().slice(4, 24);

  const embed = setupEmbed("DARK_GREEN", messageU, nMessage.author, "tag"); //setup embed
  //no auditLog when message update

  //check for un/pinned
  if (oMessage.pinned && !nMessage.pinned) {
    const unpinLog = await fetchAuditLog(nMessage.guild, "MESSAGE_UNPIN"); //get auditLog
    const unpinned = messageU.unpinned;
    embed.addField(unpinned.title, unpinned.text, true); //add unpinned text

    //add message link
    const link = `[${messageU.linkMessage}](${nMessage.url})`;
    embed.addField(messageU.linkName, link);

    endAdmin(nMessage, unpinLog, messageU, auditLog, embed, logChannel)
    return
  }
  if (!oMessage.pinned && nMessage.pinned) {
    const pinLog = await fetchAuditLog(nMessage.guild, "MESSAGE_PIN"); //get auditLog
    const pinned = messageU.pinned;
    embed.addField(pinned.title, pinned.text, true); //add unpinned text

    //add message link
    const link = `[${messageU.linkMessage}](${nMessage.url})`;
    embed.addField(messageU.linkName, link);

    endAdmin(nMessage, pinLog, messageU, auditLog, embed, logChannel);
    return
  }

  //add creation date + channel
  embed.addField(messageU.date, `${date}`, true); //date of message creation
  embed.addField(messageU.channel, `<#${oMessage.channelId}>`, true); //message channel

  //check for content modif
  const oldContent = oMessage.content;
  const newContent = nMessage.content;

  //filter changes, if < 2 length => return
  const isLengthy = Math.abs(oldContent.length - newContent.length) >= 2;
  if (oldContent !== newContent) {
    addMessageUpdateCount(newMessage.author.id, newMessage.client.db); //add count to db
    //check for emote change, for stats
    if (isLengthy) {
      const oLen = oldContent.length !== 0;
      const nLen = newContent.length !== 0;

      if (oLen)
        embed.addField(messageU.contentOld, oldContent); //to not add empty strings
      if (nLen)
        embed.addField(messageU.contentNew, newContent);

      if (oLen && nLen) {
        //check for apology
        const oSanitized = sanitizePunctuation(oldContent.toLowerCase()); //remove punctuation
        const nSanitized = sanitizePunctuation(newContent.toLowerCase());

        if (!hasApology(oSanitized) && hasApology(nSanitized)) {
          //in new message && not in old message
          const db = oMessage.client.db; //get db 
          const currentServer = commons.find(
            ({ guildId }) => guildId === nMessage.guildId
          ); //get commons.json data
          addApologyCount(nMessage.author.id, db); //add data to db
          await nMessage.react(currentServer.panDuomReactId); //add message reaction
        }
      }
    }
  }

  //check for objects changes
  const attachments = oMessage.attachments.reduce((acc, cur) => {
    if (nMessage.attachments.findKey((obj) => obj.id === cur.id) !== cur.id)
      return [...acc, cur.attachment];
    return acc;
  }, []); //check for attachments

  const oldEmbeds = oMessage.embeds;
  const newEmbeds = nMessage.embeds;
  let embeds;
  try {
    embeds =
      oldEmbeds.length !== 0 && newEmbeds.length !== 0
        ? newEmbeds.reduce(
          (acc, cur, idx) => {
            if (!cur.equals(nMessage.embeds[idx]) && cur.type !== "gifv") //exclude gifs embed which cannot be sent by bot
              return [...acc, cur];
            return acc;
          },
          [embed]
        )
        : [embed]; //check for embeds. It includes link integration
  } catch (e) {
    console.log("onMessageUpdate embeds", e);
    embeds = [embed];
  }

  if (!isLengthy && embeds.length === 1 && attachments.length === 0) return; //if no apparent modif, return

  //add message link
  const link = `[${messageU.linkMessage}](${nMessage.url})`;
  embed.addField(messageU.linkName, link);
  await finishEmbed(messageU, null, embeds, logChannel, null, attachments);
  /* if (gifs !== null) {
     const content = gifs.join("\n");
     logChannel.send(content);
   }*/
};
