import dayjs from "dayjs";
import "dayjs/locale/fr.js";
import Duration from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.locale("fr");
dayjs.extend(Duration);
dayjs.extend(relativeTime);

import { PERSONALITY } from "../personality.js";

const sendDelayed = async (
  // Function sending the reminder to the user
  client,
  channel,
  author,
  messageContent,
  botMessage
) => {
  /*
  try {
    // try to DM
    await author.send(`${author.toString()} : ${messageContent}`);
  } catch {*/
  // send in the original channel
  await channel.send(`${author.toString()} : ${messageContent}`);
  //}
  client.remindme = client.remindme.filter(
    // removes from cache
    ({ botMessage: answer }) => answer.id !== botMessage.id
  );
};

const formatMs = (nbr) => {
  return dayjs.duration(nbr, "milliseconds").humanize();
};

const extractDuration = (str) => {
  // returns the waiting time in ms
  const lowerStr = str.toLowerCase();

  // Date writing format: XXhYYmZZs

  const hours = Number(lowerStr.slice(0, 2));
  const minutes = Number(lowerStr.slice(3, 5));
  const seconds = Number(lowerStr.slice(6, 8));

  const durationMs =
    (isNaN(hours) ? 0 : hours * 3600) +
    (isNaN(minutes) ? 0 : minutes * 60) +
    (isNaN(seconds) ? 0 : seconds);

  return durationMs * 1000;
};

const answerBot = async (message, currentServer, timing) => {
  // Confirm or not the reminder to user
  /*
  try {
    // try to DM
    const answer = await message.author.send(
      PERSONALITY.getCommands().reminder.remind.concat(
        `${formatMs(timing)}. `,
        PERSONALITY.getCommands().reminder.react[0],
        `${currentServer.removeEmoji}`,
        PERSONALITY.getCommands().reminder.react[1]
      )
    );
    await answer.react(currentServer.removeEmoji);
    return answer;
  } catch {
    // reply to the request message
    console.log(`Utilisateur ayant bloqué les DMs`);*/
  const answer = await message.reply(
    PERSONALITY.getCommands().reminder.remind +
      `${formatMs(timing)}` +
      PERSONALITY.getCommands().reminder.react[0] +
      `${currentServer.removeEmoji}` +
      PERSONALITY.getCommands().reminder.react[1]
  );
  await answer.react(currentServer.removeEmoji);
  return answer;
  //}
};

const action = async (message, client, currentServer) => {
  const { channel, content, author } = message;
  const args = content.split(" ");

  const wordTiming = args[1];

  const timing = extractDuration(wordTiming);

  if (!timing) {
    //Checks for timing format
    console.log("erreur de parsing");
  } else {
    console.log("timing: ", timing);

    const messageContent = args.slice(2).join(" ");

    const answer = await answerBot(message, currentServer, timing);

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

    client.remindme.push({
      // Add request to cache
      authorId: author.id,
      botMessage: answer,
      timeout: timeoutObj,
    });
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
