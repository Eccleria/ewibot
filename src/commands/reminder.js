import dayjs from "dayjs";
import "dayjs/locale/fr.js";
import Duration from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
import {
  addReminder,
  removeReminder,
  updateReminder,
} from "../helpers/dbHelper.js";
dayjs.locale("fr");
dayjs.extend(Duration);
dayjs.extend(relativeTime);

import { PERSONALITY } from "../personality.js";

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
      const author = await client.users.fetch(element.authorId); // Find user
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
        author,
        element.content,
        botMessage
      );

      addClientReminder(client, author.id, botMessage, timeoutObj); //add to client
      updateReminder(
        db,
        botMessage.id,
        now.millisecond(newTiming).toISOString()
      ); //modify db
    });
};

const sendDelayed = async (
  // Function sending the reminder to the user
  client,
  channel,
  author,
  messageContent,
  botMessage
) => {
  try {
    //try to DM
    await author.send(`${author.toString()} : ${messageContent}`);
  } catch {
    await channel.send(`${author.toString()} : ${messageContent}`);
  }

  client.remindme = client.remindme.filter(
    // removes from cache
    ({ botMessage: answer }) => answer.id !== botMessage.id
  );
  removeReminder(client.db, botMessage.id);
};

const formatMs = (nbr) => {
  //get text from waiting time
  return dayjs.duration(nbr, "milliseconds").humanize();
};

const extractDuration = (str) => {
  // returns the waiting time in ms
  const lowerStr = str.toLowerCase();

  // Date writing format: XXhYYmZZs
  const hours = Number(lowerStr.slice(0, 2));
  const minutes = Number(lowerStr.slice(3, 5));
  const seconds = Number(lowerStr.slice(6, 8));

  const durationMs = //sum the converted hrs/mins in seconds and seconds
    (isNaN(hours) ? 0 : hours * 3600) +
    (isNaN(minutes) ? 0 : minutes * 60) +
    (isNaN(seconds) ? 0 : seconds);

  return durationMs * 1000; //convert in ms
};

const answerBot = async (message, currentServer, timing) => {
  // Confirm or not the reminder to user
  try {
    // try to DM
    const answer = await message.author.send(
      PERSONALITY.getCommands().reminder.remind.concat(
        `${formatMs(timing)}.`,
        PERSONALITY.getCommands().reminder.react[0],
        `${currentServer.removeEmoji}`,
        PERSONALITY.getCommands().reminder.react[1]
      )
    );
    await answer.react(currentServer.removeEmoji);
    return answer;
  } catch {
    // reply to the request message
    console.log(`Utilisateur ayant bloqué les DMs`);
    const answer = await message.reply(
      PERSONALITY.getCommands().reminder.remind +
        `${formatMs(timing)}` +
        PERSONALITY.getCommands().reminder.react[0] +
        `${currentServer.removeEmoji}` +
        PERSONALITY.getCommands().reminder.react[1]
    );
    await answer.react(currentServer.removeEmoji);
    return answer;
  }
};

const action = async (message, client, currentServer) => {
  const { channel, content, author } = message;
  const args = content.split(" ");
  const wordTiming = args[1];

  if (args.length <= 1) {
    //if only $reminder
    message.reply(PERSONALITY.getCommands().reminder.notEnoughArgs);
    return;
  }
  const timing = extractDuration(wordTiming);

  if (!timing) {
    //Checks for timing format
    console.log("erreur de parsing");
  } else {
    console.log("timing: ", timing);

    const messageContent = args.slice(2).join(" "); //get user message to remind

    const answer = await answerBot(message, currentServer, timing); //get Ewibot answer

    const timeoutObj = setTimeout(
      // Set waiting time before reminding to user
      sendDelayed,
      timing,
      client,
      channel,
      author,
      messageContent,
      answer
    );

    const reminderDate = dayjs().millisecond(timing).toISOString(); //waiting time before reminder in ms

    addClientReminder(client, author.id, answer, timeoutObj);
    addReminder(client.db, message, answer, reminderDate, messageContent);
  }
};

const reminder = {
  name: "reminder",
  action,
  help: () => {
    return PERSONALITY.getCommands().reminder.help;
  },
  admin: false,
};

export default reminder;
