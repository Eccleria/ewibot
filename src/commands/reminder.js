import dayjs from "dayjs";
import "dayjs/locale/fr.js";
import Duration from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.locale("fr");
dayjs.extend(Duration);
dayjs.extend(relativeTime);

import personnalities from "../personnalities.json";

const PERSONNALITY = personnalities.normal;

const sendDelayed = async (
  client,
  channel,
  author,
  messageContent,
  botMessage
) => {
  try {
    await author.send(`${author.toString()} : ${messageContent}`);
  } catch {
    await channel.send(`${author.toString()} : ${messageContent}`);
  }
  client.remindme = client.remindme.filter(
    ({ botMessage: answer }) => answer.id !== botMessage.id
  );
};

const formatMs = (nbr) => {
  return dayjs.duration(nbr, "milliseconds").humanize();
};

const extractDuration = (str) => {
  const lowerStr = str.toLowerCase();

  // XXhYYmZZs

  const hours = Number(lowerStr.slice(0, 2));
  const minutes = Number(lowerStr.slice(3, 5));
  const seconds = Number(lowerStr.slice(6, 8));

  const durationMs =
    (isNaN(hours) ? 0 : hours * 3600) +
    (isNaN(minutes) ? 0 : minutes * 60) +
    (isNaN(seconds) ? 0 : seconds);

  return durationMs * 1000;
};

const answerBot = async (message, personality, currentServer, timing) => {
  try {
    const answer = await message.author.send(
      personality.reminder.remind.concat(
        `${formatMs(timing)}`,
        personality.reminder.react[0],
        `${currentServer.removeEmoji}`,
        personality.reminder.react[1]
      )
    );
    await answer.react(currentServer.removeEmoji);
    return answer;
  } catch {
    console.log(`Utilisateur ayant bloqué les DMs`);
    const answer = await message.reply(
      personality.reminder.remind.concat(
        `${formatMs(timing)}`,
        personality.reminder.react[0],
        `${currentServer.removeEmoji}`,
        personality.reminder.react[1]
      )
    );
    await answer.react(currentServer.removeEmoji);
    return answer;
  }
};

const action = async (message, client, currentServer) => {
  const { channel, content, author } = message;
  const args = content.split(" ");

  const wordTiming = args[1];

  const timing = extractDuration(wordTiming);

  if (!timing) {
    console.log("erreur de parsing");
  } else {
    console.log("timing: ", timing);

    const messageContent = args.slice(2).join(" ");

    const answer = answerBot(message, currentServer, timing);

    const timeoutObj = setTimeout(
      sendDelayed,
      timing,
      client,
      channel,
      author,
      messageContent,
      answer
    );

    client.remindme.push({
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
    return PERSONNALITY.commands.helloWorld.help;
  },
  admin: false,
};

export default reminder;
