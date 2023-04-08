import dayjs from "dayjs";
import "dayjs/locale/fr.js";
import Duration from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.locale("fr");
dayjs.extend(Duration);
dayjs.extend(relativeTime);

import { isStatsUser, addCommandCount } from "../helpers/index.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import { PERSONALITY } from "../personality.js";

// jsons import
import { readFileSync } from "fs";
import { interactionReply } from "./utils.js";
const commons = JSON.parse(readFileSync("static/commons.json"));

const sendDelayed = async (
  // Function sending the reminder to the user
  client,
  channel,
  author,
  messageContent,
  botMessage
) => {
  await channel.send(`${author.toString()} : ${messageContent}`);
  client.remindme = client.remindme.filter(
    // removes from cache
    ({ botMessage: answer }) => answer.id !== botMessage.id
  );
};

const formatMs = (nbr) => {
  return dayjs.duration(nbr, "milliseconds").humanize();
};

const extractDuration = (interaction, type) => {
  // returns the waiting time in ms
  let hours, minutes, seconds;

  if (type === "/") {
    hours = interaction.options.getNumber("heures");
    minutes = interaction.options.getNumber("minutes");
    seconds = interaction.options.getNumber("secondes");
  } else if (type === "$") {
    const lowerStr = interaction.toLowerCase();
    hours = Number(lowerStr.slice(0, 2));
    minutes = Number(lowerStr.slice(3, 5));
    seconds = Number(lowerStr.slice(6, 8));
  }

  const durationMs =
    (isNaN(hours) ? 0 : hours * 3600) +
    (isNaN(minutes) ? 0 : minutes * 60) +
    (isNaN(seconds) ? 0 : seconds);

  return durationMs * 1000;
};

const answerBot = async (interaction, currentServer, timing, type) => {
  // Confirm or not the reminder to user
  const personality = PERSONALITY.getCommands().reminder;
  let answer;

  if (type === "/") {
    await interactionReply(
      interaction,
      personality.remind +
        `${formatMs(timing)}` +
        personality.react[0] +
        `${currentServer.removeEmoji}` +
        personality.react[1],
      false
    );
    answer = await interaction.fetchReply();
  } else
    answer = await interaction.reply(
      PERSONALITY.getCommands().reminder.remind +
        `${formatMs(timing)}` +
        PERSONALITY.getCommands().reminder.react[0] +
        `${currentServer.removeEmoji}` +
        PERSONALITY.getCommands().reminder.react[1]
    );

  await answer.react(currentServer.removeEmoji);
  return answer;
};

const action = async (interaction, type) => {
  const { channel, client } = interaction;
  let timing, member, messageContent;

  if (type === "$") {
    member = interaction.author;

    const args = interaction.content.split(" ");
    const wordTiming = args[1];

    messageContent = args.slice(2).join(" ");
    timing = extractDuration(wordTiming, type);
  } else if (type === "/") {
    member = interaction.member;

    //get interaction input
    messageContent = interaction.options.getString("contenu");
    timing = extractDuration(interaction, type); //waiting time in ms
  }

  if (!timing) {
    //Checks for timing format
    const content = PERSONALITY.getCommands().reminder.error;
    type === "/"
      ? interactionReply(interaction, content)
      : interaction.reply(content);
  } else {
    console.log("reminder timing: ", timing);

    const currentServer = commons.find(
      ({ guildId }) => guildId === interaction.guildId
    );

    const answer = await answerBot(interaction, currentServer, timing, type);

    const timeoutObj = setTimeout(
      // Set waiting time before reminding to user
      sendDelayed,
      timing,
      client,
      channel,
      member,
      messageContent,
      answer
    );

    client.remindme.push({
      // Add request to cache
      authorId: member.id,
      botMessage: answer,
      timeout: timeoutObj,
    });

    if (isStatsUser(client.db, member.id)) addCommandCount(member.id, client.db, "concrete"); //add data to db
  }
};

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getCommands().reminder.name)
  .setDescription(PERSONALITY.getCommands().reminder.description)
  .addStringOption((option) =>
    option
      .setName(PERSONALITY.getCommands().reminder.stringOption.name)
      .setDescription(
        PERSONALITY.getCommands().reminder.stringOption.description
      )
      .setRequired(true)
      .setMinLength(1)
  )
  .addNumberOption((option) =>
    option //hour
      .setName(PERSONALITY.getCommands().reminder.hourOption.name)
      .setDescription(PERSONALITY.getCommands().reminder.hourOption.name)
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(99)
  )
  .addNumberOption((option) =>
    option //minutes
      .setName(PERSONALITY.getCommands().reminder.minuteOption.name)
      .setDescription(
        PERSONALITY.getCommands().reminder.minuteOption.description
      )
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(60)
  )
  .addNumberOption((option) =>
    option //seconds
      .setName(PERSONALITY.getCommands().reminder.secondOption.name)
      .setDescription(
        PERSONALITY.getCommands().reminder.secondOption.description
      )
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(60)
  );

const reminder = {
  name: "reminder",
  command: command,
  action,
  help: (interaction) => {
    const content = PERSONALITY.getCommands().reminder.help;
    interactionReply(interaction, content);
  },
  admin: false,
  releaseDate: null, //dayjs("12-09-2022", "MM-DD-YYYY"),
  sentinelle: false,
};

export default reminder;
