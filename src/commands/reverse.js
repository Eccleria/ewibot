import dayjs from "dayjs";
import {
  SlashCommandBuilder,
  ContextMenuCommandBuilder,
} from "@discordjs/builders";

import { PERSONALITY } from "../personality.js";

import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("static/commons.json"));

import { interactionReply } from "./utils.js";
import { MessageEmbed } from "discord.js";

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

const contextAction = (interaction) => {
  const message = interaction.targetMessage; //get message

  //if in log_channel => should handle embed contents + send as visible for anyone
  const server = commons.find((obj) => obj.guildId === interaction.guildId);
  const channels = [server.logChannelId, server.logThreadId];
  let string;
  if (channels.includes(interaction.channelId)) {
    //look for correct embeds
    const adminPerso = PERSONALITY.getAdmin();

    const embeds = message.embeds;
    console.log(embeds);
    const fields = embeds.length !== 0 ? embeds[0].fields : null;
    switch (embeds[0].title) {
      case adminPerso.messageDelete.title: {
        const mDPerso = adminPerso.messageDelete;
        const rTPerso = PERSONALITY.getCommands().reverseTranslator;

        const titles = [mDPerso.text, mDPerso.textAgain];
        string = fields.reduce((acc, fld) => {
          if (titles.includes(fld.name)) return acc + fld.value;
          else return acc;
        }, "");

        const reversed = reverseStr(string); //reverse message content
        const content = reversed.startsWith("~~")
          ? reversed.slice(2, -2)
          : reversed;

        const embedTr = new MessageEmbed()
          .setTitle(rTPerso.title)
          .setColor("DARK_RED")
          .setTimestamp()
          .setAuthor(interaction.member.toString())
          .addFields({ name: rTPerso.embedName, value: content });

        message.edit({ embeds: [...embeds, embedTr] });

        return;
      }
      case adminPerso.messageUpdate.title: {
        const mUPerso = adminPerso.messageUpdate;
        const rTPerso = PERSONALITY.getCommands().reverseTranslator;

        const oTitles = [mUPerso.contentOld, mUPerso.contentOldAgain];
        const nTitles = [mUPerso.contentNew, mUPerso.contentNewAgain];
        string = fields.reduce((acc, fld) => {
          if (oTitles.includes(fld.name)) return { old: acc.old + fld.value, new: acc.new };
          else if (nTitles.includes(fld.name)) return { old: acc.old, new: acc.new + fld.value };
          else return acc;
        }, { old: "", new: "" });

        const reversed = {
          old: reverseStr(string.old), new: reverseStr(string.new)
        }; //reverse message content
        const oContent = reversed.old.startsWith("~~")
          ? reversed.old.slice(2, -2)
          : reversed.old;
        const nContent = reversed.new.startsWith("~~")
          ? reversed.new.slice(2, -2)
          : reversed.new;

        const embedTr = new MessageEmbed()
          .setTitle(rTPerso.title)
          .setColor("DARK_GREEN")
          .setTimestamp()
          .setAuthor(interaction.member.toString());

        const oSlice = Math.ceil(oContent.length / 1024); //get number of time to slice oldContent by 1024
        if (oSlice > 1) {
          //if need to slice
          const oSliced = sliceAddString(oSlice, oContent); //slice and add to embed

          oSliced.forEach((str, idx) => {
            if (idx === 0)
              embedTr.addFields({
                name: mUPerso.contentOld,
                value: str,
              });
            //name's different from others
            else embed.addFields({ name: mUPerso.contentOldAgain, value: str });
          });
        } else embed.addFields({ name: mUPerso.contentOld, value: oContent });

        if (nLen !== 0) {
          const nSlice = Math.ceil(nContent.length / 1024); //get number of time to slice oldContent by 1024;
          if (nSlice > 1) {
            const nSliced = sliceAddString(nSlice, nContent); //slice and add to embed

            nSliced.forEach((str, idx) => {
              if (idx === 0)
                embed.addFields({
                  name: mUPerso.contentNew,
                  value: str,
                });
              //name's different from others
              else embed.addFields({ name: mUPerso.contentNewAgain, value: str });
            });
          } else embed.addFields({ name: mUPerso.contentNew, value: nContent });
        }
        return;
      }
    }
  } else {
    string = message.content; //get message content

    const reversed = reverseStr(string); //reverse message content
    const content = reversed.startsWith("~~") ? reversed.slice(2, -2) : reversed;

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
