import dayjs from "dayjs";
import {
  SlashCommandBuilder,
  ContextMenuCommandBuilder,
} from "@discordjs/builders";

import { PERSONALITY } from "../personality.js";

import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("static/commons.json"));

import { interactionReply, dispatchSlicedEmbedContent } from "./utils.js";
import { MessageEmbed } from "discord.js";
import { getLogChannel } from "../admin/utils.js";

const reverseStr = (string) => {
  let reversed = "";
  let isInMentionable = false;
  let mention = "";

  for (const char of string) {
    if (char === "<") isInMentionable = true;
    if (!isInMentionable) reversed = char + reversed;
    if (isInMentionable) mention = mention + char;
    if (char === ">") {
      isInMentionable = false;
      reversed = mention + reversed;
      mention = "";
    }
  }
  return reversed;
};

// SLASH COMMAND

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getCommands().reverse.name)
  .setDescription(PERSONALITY.getCommands().reverse.description)
  .addStringOption((option) =>
    option
      .setName(PERSONALITY.getCommands().reverse.stringOption.name)
      .setDescription(
        PERSONALITY.getCommands().reverse.stringOption.description
      )
      .setRequired(true)
  )
  .addBooleanOption((option) =>
    option
      .setName(PERSONALITY.getCommands().reverse.booleanOption.name)
      .setDescription(
        PERSONALITY.getCommands().reverse.booleanOption.description
      )
      .setRequired(false)
  );

const action = (interaction) => {
  const options = interaction.options;
  const personality = PERSONALITY.getCommands().reverse;
  const string = options.getString(personality.stringOption.name);
  const toCrossOut = options.getBoolean(personality.booleanOption.name);

  const reversed = reverseStr(string);
  const content = toCrossOut ? "`~~" + reversed + "~~`" : reversed;

  interactionReply(interaction, content);
};

const reverse = {
  action,
  command,
  help: (interaction) => {
    const personality = PERSONALITY.getCommands().reverse;
    interactionReply(interaction, personality.help);
  },
  admin: false,
  releaseDate: dayjs("12-08-2022", "MM-DD-YYYY"),
  sentinelle: false,
};

// CONTEXT COMMAND

const contextCommand = new ContextMenuCommandBuilder()
  .setName(PERSONALITY.getCommands().reverseTranslator.name)
  .setType(3);

const contextAction = async (interaction) => {
  const message = interaction.targetMessage; //get message

  //if in log_channel => should handle embed contents + send as visible for anyone
  const server = commons.find((obj) => obj.guildId === interaction.guildId);
  const channels = [server.logChannelId, server.logThreadId];
  let string;
  if (channels.includes(interaction.channelId)) {
    //look for correct embeds
    const adminPerso = PERSONALITY.getAdmin();
    const rTPerso = PERSONALITY.getCommands().reverseTranslator;

    //get embed data
    const embeds = message.embeds;
    const fields = embeds.length !== 0 ? embeds[0].fields : null;
    const title = embeds[0].title;

    //check for precedent translation
    if (title === rTPerso.title || embeds.map((obj) => obj.title).includes(rTPerso.title)) {
      interactionReply(interaction, rTPerso.alreadyTranslated);
      return
    }

    const embedTr = new MessageEmbed()
      .setTitle(rTPerso.title)
      .setTimestamp()

    if (title === adminPerso.messageDelete.title) {
      const mDPerso = adminPerso.messageDelete;

      const titles = [mDPerso.text, mDPerso.textAgain];
      const string = fields.reduce((acc, fld) => {
        if (titles.includes(fld.name)) return acc + fld.value;
        else return acc;
      }, "");

      const reversed = reverseStr(string); //reverse message content
      const content = reversed.startsWith("~~")
        ? reversed.slice(2, -2)
        : reversed;

      embedTr.setColor("DARK_RED")

      dispatchSlicedEmbedContent(content, embedTr, mDPerso);

    } else if (title === adminPerso.messageUpdate.title) {
      const mUPerso = adminPerso.messageUpdate;

      const oTitles = Object.values(mUPerso.contentOld);
      const nTitles = Object.values(mUPerso.contentNew);
      const string = fields.reduce(
        (acc, fld) => {
          console.log("field", fld);
          if (oTitles.includes(fld.name))
            return { old: acc.old + fld.value, new: acc.new };
          else if (nTitles.includes(fld.name))
            return { old: acc.old, new: acc.new + fld.value };
          else return acc;
        },
        { old: "", new: "" }
      );

      //reverse content
      const reversed = {
        old: reverseStr(string.old),
        new: reverseStr(string.new),
      }; //reverse message content
      const oContent = reversed.old.startsWith("~~")
        ? reversed.old.slice(2, -2)
        : reversed.old;
      const nContent = reversed.new.startsWith("~~")
        ? reversed.new.slice(2, -2)
        : reversed.new;

      embedTr.setColor("DARK_GREEN")

      dispatchSlicedEmbedContent(oContent, embedTr, mUPerso.contentOld);
      dispatchSlicedEmbedContent(nContent, embedTr, mUPerso.contentNew);

    }

    //add interaction author
    embedTr.addFields({
      name: rTPerso.executor,
      value: interaction.member.toString(),
    });

    //test for 6000 length limit
    const newEmbeds = [...embeds, embedTr]
    const size = newEmbeds.reduce((acc, cur) => acc + cur.length, 0);
    if (size > 6000) {
      message.delete(); //delete old log which will be doublon
      const logChannel = await getLogChannel(interaction, "thread");
      const msg = await logChannel.send({ embeds: embeds });
      msg.reply({ embeds: [embedTr] });

    } else {
      //send translation
      message.edit({ embeds: newEmbeds });
      interactionReply(interaction, rTPerso.translated);
    }
  } else {
    string = message.content; //get message content

    const reversed = reverseStr(string); //reverse message content
    const content = reversed.startsWith("~~")
      ? reversed.slice(2, -2)
      : reversed;

    interactionReply(interaction, content);
  }
};

const reverseTranslator = {
  action: contextAction,
  command: contextCommand,
  help: (interaction) => {
    const personality = PERSONALITY.getCommands().reverseTranslator;
    interactionReply(interaction, personality.help);
  },
  admin: false,
  releaseDate: dayjs("12-16-2022", "MM-DD-YYYY"),
  sentinelle: false,
};

export { reverse, reverseTranslator };
