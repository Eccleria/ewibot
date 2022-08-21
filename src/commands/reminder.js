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
const commons = JSON.parse(readFileSync("static/commons.json"));

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

const extractDuration = (interaction) => {
  // returns the waiting time in ms
  /*
  const lowerStr = str.toLowerCase();

  // Date writing format: WWdXXhYYmZZs global
  const timeRegex = new RegExp(/([[:digit:]][[:digit:]]?d)?([[:digit:]][[:digit:]]?h)?([[:digit:]][[:digit:]]?m)?([[:digit:]][[:digit:]]?s)?/gmi);
  const timeResult = timeRegex.exec(str); //duration recognition

  console.log("timeResult", timeResult);
  */
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
  /*
  try {
    // try to DM
    const answer = await message.author.send(
      personality.remind.concat(
        `${formatMs(timing)}. `,
        personality.react[0],
        `${currentServer.removeEmoji}`,
        personality.react[1]
      )
    );
    await answer.react(currentServer.removeEmoji);
    return answer;
  } catch {
    // reply to the request message
    console.log(`Utilisateur ayant bloqué les DMs`);*/
  await interaction.reply({
    content:
      personality.remind +
      `${formatMs(timing)}` +
      personality.react[0] +
      `${currentServer.removeEmoji}` +
      personality.react[1],
    ephemeral: true,
  });

  const answer = await interaction.fetchReply();
  //await answer.react(currentServer.removeEmoji);
  return answer;
  //}
};

const action = async (interaction) => {
  const { channel, member, client } = interaction;

  const messageContent = interaction.options.getString("contenu");
  const isEphemeral = interaction.options.getBoolean("privé")

  const timing = extractDuration(interaction);

  if (!timing) {
    //Checks for timing format
    console.log("erreur de parsing");
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
  .setName("reminder")
  .setDescription("Une commande alarme pense-bête.")
  .addStringOption((option) =>
    option
      .setName("contenu")
      .setDescription("Contenu du pense-bête.")
      .setRequired(true)
      .setMinLength(1)
  )
  .addNumberOption((option) =>
    option
      .setName("heures")
      .setDescription("Le nombre d'heure d'attente.")
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(99)
  )
  .addNumberOption((option) =>
    option
      .setName("minutes")
      .setDescription("Le nombre de minutes d'attente.")
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(60)
  )
  .addNumberOption((option) =>
    option
      .setName("secondes")
      .setDescription("Le nombre de secondes d'attente.")
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(60)
)
  .addBooleanOption((option) => option
    .setName("privé")
    .setDescription("Est-ce que le message est caché ou non. Publique par défaut.")
    .setRequired(false)
  );

const reminder = {
  name: "reminder",
  command: command,
  action,
  help: () => {
    return PERSONALITY.getCommands().reminder.help;
  },
  admin: false,
};

export default reminder;
