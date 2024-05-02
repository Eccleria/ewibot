import dayjs from "dayjs";
import "dayjs/locale/fr.js";
import Duration from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.locale("fr");
dayjs.extend(Duration);
dayjs.extend(relativeTime);

import { SlashCommandBuilder } from "@discordjs/builders";
import {
  addReminder,
  addReminderUser,
  interactionReply,
  isReminderUser,
  removeReminder,
  updateReminderTime,
} from "../helpers/index.js";
import { COMMONS } from "../commons.js";
import { PERSONALITY } from "../personality.js";

const addClientReminder = (client, authorId, botMessage, timeoutObj) => {
  //add the reminder in the client
  client.remindme.push({
    authorId: authorId,
    botMessage: botMessage,
    timeout: timeoutObj,
  });
};

export const removeClientReminder = (client, botMessageId) => {
  client.remindme = client.remindme.filter(
    (obj) => obj.botMessage.id !== botMessageId
  );
};

/**
 * Recover reminders from db at startup
 * @param {*} client 
 */
export const initReminder = async (client) => {
  const db = client.db;
  if (db.data && db.data.reminder.length > 0)
    db.data.reminder.forEach(async (element) => {
      const toMention = element.toMention;
      const requestChannel = await client.channels.fetch(
        element.requestChannelId
      ); //Find channel with user's request
      const answerChannel = await client.channels.fetch(
        element.answerChannelId
      ); //Find channel with Ewibot answer
      const botMessage = await answerChannel.messages.fetch(element.answerId); //Find bot response

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
        toMention,
        element.content,
        botMessage
      );

      addClientReminder(client, element.authorId, botMessage, timeoutObj); //add to client
      updateReminderTime(
        db,
        botMessage.id,
        now.millisecond(newTiming).toISOString()
      ); //modify db
    });
};

/**
 * Function sending the reminder to the user
 */
const sendDelayed = async (
  client,
  channel,
  toMention,
  messageContent,
  botMessage
) => {
  const toMentionText = toMention.reduce((acc, cur) => acc + ` <@${cur}>`, "");
  await channel.send(toMentionText + " : " + messageContent);

  removeReminder(client.db, botMessage.id); //from db
  removeClientReminder(client, botMessage.id); //from client
};

/**
 * get text from waiting time
 */
const formatMs = (nbr) => {
  return dayjs.duration(nbr, "milliseconds").humanize();
};

/**
 * returns the waiting time in ms
 */
const extractDuration = (interaction) => {
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

/**
 * Confirm or not the reminder to user
 */
const answerBot = async (interaction, cmnShared, timing) => {
  
  const personality = PERSONALITY.getCommands().reminder;
  const { removeEmoji, participateEmoji } = cmnShared;

  await interactionReply(
    interaction,
    personality.remind +
      `${formatMs(timing)}` +
      personality.react[0] +
      `${removeEmoji}` +
      personality.react[1],
    false
  );
  const answer = await interaction.fetchReply();

  await answer.react(removeEmoji);
  await answer.react(participateEmoji);
  return answer;
};

export const removeCDReaction = (messageReaction, userId) => {
  messageReaction.users.remove(userId);
};

/** */
export const participateHandler = async (messageReaction, user) => {
  //find reminder message
  const {client, message} = messageReaction;
  const db = client.db;
  console.log("remindme", client.remindme);
  if (client.remindme.find((obj) => obj.botMessage.id === message.id)) {
    console.log("found client remindme")
    const commons = COMMONS.getShared();

    //check if user is already in reminder list
    if(isReminderUser(db, message.id, user.id)) {
      console.log("user already in reminder db")
      messageReaction.users.remove(user.id); //remove reaction
      const denyReact = await message.react(commons.denyEmoji);

      //wait 5s and remove reaction
      setTimeout(removeCDReaction, 5000, denyReact, client.user.id);
    }

    //store user id
    addReminderUser(client.db, reminder, user);

    //react and remove react
    const confirmReact = await message.react(commons.denyEmoji);
    setTimeout(removeCDReaction, 5000, confirmReact, client.user.id);
  }
};

const action = async (interaction) => {
  const { client, member, channel } = interaction;

  //get interaction input
  const messageContent = interaction.options.getString("contenu");
  const timing = extractDuration(interaction); //waiting time in ms

  if (!timing) {
    //Checks for timing format
    const content = PERSONALITY.getCommands().reminder.error;
    interactionReply(interaction, content);
  } else {
    console.log("reminder timing: ", timing);
    const cmnShared = COMMONS.getShared();

    const answer = await answerBot(interaction, cmnShared, timing); //send bot answer

    //compute useful data
    const reminderDate = dayjs().millisecond(timing).toISOString(); //waiting time before reminder in ms
    const toMention = [member.id]; //list of users to mention when timeout is ended

    const timeoutObj = setTimeout(
      // Set waiting time before reminding to user
      sendDelayed,
      timing,
      client,
      channel,
      toMention,
      messageContent,
      answer
    );

    addReminder(
      client.db,
      interaction,
      answer,
      reminderDate,
      messageContent,
      toMention
    );
    addClientReminder(client, member.id, answer, timeoutObj);
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
