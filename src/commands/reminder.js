import dayjs from "dayjs";
import "dayjs/locale/fr.js";
import Duration from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.locale("fr");
dayjs.extend(Duration);
dayjs.extend(relativeTime);

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

const extractDuration = (interaction) => {
  // returns the waiting time in ms

  const hours = interaction.options.getNumber("heures");
  const minutes = interaction.options.getNumber("minutes");
  const seconds = interaction.options.getNumber("secondes");

  const durationMs =
    (isNaN(hours) ? 0 : hours * 3600) +
    (isNaN(minutes) ? 0 : minutes * 60) +
    (isNaN(seconds) ? 0 : seconds);

  return durationMs * 1000;
};

const answerBot = async (interaction, currentServer, timing) => {
  // Confirm or not the reminder to user
  const personality = PERSONALITY.getCommands().reminder;

  await interactionReply(
    interaction,
    personality.remind +
      `${formatMs(timing)}` +
      personality.react[0] +
      `${currentServer.removeEmoji}` +
      personality.react[1],
    false
  );
  const answer = await interaction.fetchReply();

  await answer.react(currentServer.removeEmoji);
  return answer;
};

const action = async (interaction) => {
  const { client, member, channel } = interaction;

    //get interaction input
    const messageContent = interaction.options.getString("contenu");
    const timing = extractDuration(interaction); //waiting time in ms

  if (!timing) {
    //Checks for timing format
    const content = PERSONALITY.getCommands().reminder.error;
    interactionReply(interaction, content)
  } else {
    console.log("reminder timing: ", timing);

    const currentServer = commons.find(
      ({ guildId }) => guildId === interaction.guildId
    );

    const answer = await answerBot(interaction, currentServer, timing);

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
