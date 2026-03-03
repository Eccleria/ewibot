import { fetchMessage } from "ewilib";

import { isTestServer, removeUserFromDB } from "./utils.js";
import {
  addApologyCount,
  hasApology,
  removePunctuation,
} from "../helpers/index.js";
import { COMMONS } from "../classes/commons.js";

//#region LISTENERS

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
  if (oMessage.author.id === process.env.CLIENTID) return; //ignore itself

  const currentServer = COMMONS.fetchFromGuildId(newMessage.guildId);
  if (newMessage.channelId === currentServer.logThreadId) return;

  if (process.env.DEBUG === "no" && isTestServer(newMessage)) return; //if in prod && modif in test server

  //check for content modif
  const oldContent = oMessage.content;
  const newContent = nMessage.content;

  //filter changes, if < 2 length => return
  const isDiff = oldContent !== newContent;
  if (isDiff) {
    const oLen = oldContent.length;
    const nLen = newContent.length;

    if (oLen !== 0 && nLen !== 0) {
      //check for apology
      const oSanitized = removePunctuation(oldContent.toLowerCase()); //remove punctuation
      const nSanitized = removePunctuation(newContent.toLowerCase());

      if (!hasApology(oSanitized) && hasApology(nSanitized)) {
        //in new message && not in old message
        const db = oMessage.client.db; //get db
        const currentServer = COMMONS.fetchFromGuildId(nMessage.guildId); //get commons.json data
        addApologyCount(db, nMessage.author.id); //add data to db
        await nMessage.react(currentServer.panDuomReactId); //add message reaction
      }
    }
  }
};

export const onGuildMemberRemove = async (memberKick) => {
  //handle guildMember kicked or leaving the server
  console.log("member kicked from/left Discord Server");

  const userKick = memberKick.user;
  removeUserFromDB(userKick.id, userKick.client); //remove user from db

  console.log("memberKick", userKick);
};

//#endregion
