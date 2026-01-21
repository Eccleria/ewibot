import dayjs from "dayjs";
import "dayjs/locale/fr.js";
import Duration from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.locale("fr");
dayjs.extend(Duration);
dayjs.extend(relativeTime);

import { SlashCommandBuilder } from "@discordjs/builders";
import {
  channelSend,
  fetchChannel,
  fetchMessage,
  fetchUser,
  interactionReply,
} from "ewilib";

import {
  addReminder,
  removeReminder,
  updateReminder,
} from "../helpers/index.js";
import { COMMONS } from "../classes/commons.js";
import { PERSONALITY } from "../classes/personality.js";

const addClientReminder = (client, authorId, botMessage, timeoutObj) => {
  //add the reminder in the client
  client.remindme.push({
    authorId: authorId,
    botMessage: botMessage,
    timeout: timeoutObj,
  });
};

export const initReminder = async (client) => {
  //recover reminders from db
  const db = client.db;
  if (db.data && db.data.reminder.length > 0)
    db.data.reminder.forEach(async (element) => {
      const author = await fetchUser(client.users, element.authorId); // Find user
      const requestChannel = await fetchChannel(
        client.channels,
        element.requestChannelId,
      ); //Find channel with user's request
      const answerChannel = await fetchChannel(
        client.channels,
        element.answerChannelId,
      ); //Find channel with Ewibot answer
      const botMessage = await fetchMessage(
        answerChannel.messages,
        element.answerId,
      ); //Find bot response

      //compute new reminder waiting time
      const now = dayjs();
      const difference = dayjs(element.reminderTime).diff(now);
      const newTiming = difference > 0 ? difference : 10000; //if passed, waiting time of 10s
      console.log("newTiming", newTiming);

      const timeoutObj = setTimeout(
        //set Timeout until reminder
        sendDelayed,
        newTiming,
        client,
        requestChannel,
        author,
        element.content,
        botMessage,
      );

      addClientReminder(client, author.id, botMessage, timeoutObj); //add to client
      updateReminder(
        db,
        botMessage.id,
        now.millisecond(newTiming).toISOString(),
      ); //modify db
    });
};

const sendDelayed = async (
  // Function sending the reminder to the user
  client,
  channel,
  author,
  messageContent,
  botMessage,
) => {
  await channelSend(channel, `${author.toString()} : ${messageContent}`);

  removeReminder(client.db, botMessage.id);
};

const formatMs = (nbr) => {
  //get text from waiting time
  return dayjs.duration(nbr, "milliseconds").humanize();
};

const extractDuration = (interaction) => {
  // returns the waiting time in ms

  const hours = interaction.options.getNumber("heures");
  const minutes = interaction.options.getNumber("minutes");
  const seconds = interaction.options.getNumber("secondes");

  //sum sec and hrs/mins converted in seconds
  const durationMs =
    (isNaN(hours) ? 0 : hours * 3600) +
    (isNaN(minutes) ? 0 : minutes * 60) +
    (isNaN(seconds) ? 0 : seconds);

  return durationMs * 1000; //convert in ms
};

const answerBot = async (interaction, cmnShared, timing) => {
  // Confirm or not the reminder to user
  const personality = PERSONALITY.getPersonality().reminder;
  const { removeEmoji } = cmnShared;

  await interactionReply(
    interaction,
    personality.remind +
      `${formatMs(timing)}` +
      personality.react[0] +
      `${removeEmoji}` +
      personality.react[1],
    false,
  );
  const answer = await interaction.fetchReply();

  await answer.react(removeEmoji);
  return answer;
};

const action = async (interaction) => {
  const { client, member, channel } = interaction;

  //get interaction input
  const messageContent = interaction.options.getString("contenu");
  const timing = extractDuration(interaction); //waiting time in ms

  if (!timing) {
    //Checks for timing format
    const content = PERSONALITY.getPersonality().reminder.error;
    interactionReply(interaction, content);
  } else {
    console.log("reminder timing: ", timing);
    const cmnShared = COMMONS.getShared();

    const answer = await answerBot(interaction, cmnShared, timing);
    const reminderDate = dayjs().millisecond(timing).toISOString(); //waiting time before reminder in ms

    const timeoutObj = setTimeout(
      // Set waiting time before reminding to user
      sendDelayed,
      timing,
      client,
      channel,
      member,
      messageContent,
      answer,
    );

    addReminder(client.db, interaction, answer, reminderDate, messageContent);
    addClientReminder(client, member.id, answer, timeoutObj);
  }
};

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getPersonality().reminder.name)
  .setDescription(PERSONALITY.getPersonality().reminder.description)
  .addStringOption((option) =>
    option
      .setName(PERSONALITY.getPersonality().reminder.stringOption.name)
      .setDescription(
        PERSONALITY.getPersonality().reminder.stringOption.description,
      )
      .setRequired(true)
      .setMinLength(1),
  )
  .addNumberOption((option) =>
    option //hour
      .setName(PERSONALITY.getPersonality().reminder.hourOption.name)
      .setDescription(PERSONALITY.getPersonality().reminder.hourOption.name)
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(99),
  )
  .addNumberOption((option) =>
    option //minutes
      .setName(PERSONALITY.getPersonality().reminder.minuteOption.name)
      .setDescription(
        PERSONALITY.getPersonality().reminder.minuteOption.description,
      )
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(60),
  )
  .addNumberOption((option) =>
    option //seconds
      .setName(PERSONALITY.getPersonality().reminder.secondOption.name)
      .setDescription(
        PERSONALITY.getPersonality().reminder.secondOption.description,
      )
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(60),
  );

const reminder = {
  name: "reminder",
  command: command,
  action,
  help: (interaction) => {
    const content = PERSONALITY.getPersonality().reminder.help;
    interactionReply(interaction, content);
  },
  admin: false,
  releaseDate: null, //dayjs("12-09-2022", "MM-DD-YYYY"),
  sentinelle: false,
};

export default reminder;
