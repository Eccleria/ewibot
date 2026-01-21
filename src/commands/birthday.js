import dayjs from "dayjs";
import CustomParseFormat from "dayjs/plugin/customParseFormat.js";
import "dayjs/locale/fr.js";
dayjs.locale("fr");
dayjs.extend(CustomParseFormat);
import { SlashCommandBuilder } from "@discordjs/builders";
import { channelSend, fetchChannel, interactionReply } from "ewilib";

import {
  addBirthday,
  isBirthdayDate,
  removeBirthday,
} from "../helpers/index.js";
import { COMMONS } from "../classes/commons.js";
import { PERSONALITY } from "../classes/personality.js";

export const initBirthdays = (client, tomorrowDiff, frequency) => {
  const db = client.db;

  setTimeout(async () => {
    // init birthday check
    const server =
      process.env.DEBUG === "yes" ? COMMONS.getTest() : COMMONS.getProd();
    const channel = await fetchChannel(
      client.channels,
      server.randomfloodChannelId,
    );
    console.log("hello, timeoutBirthday");

    wishBirthday(db, channel);

    setInterval(wishBirthday, frequency, db, channel); // Set birthday check every morning @ 8am.
  }, tomorrowDiff);
};

export const wishBirthday = async (db, channel) => {
  // Wish birthdays if there are some
  const today = dayjs().hour(8).minute(0).second(0).millisecond(0); // 8AM, local hour
  const users = db.data.birthdaysUsers;

  const foundBirthdays = users.filter(({ birthdayDate }) => {
    // Checks if it is birthday for some users
    const date = dayjs(birthdayDate);
    return date.month() === today.month() && date.date() === today.date();
  });

  if (foundBirthdays.length !== 0) {
    // if there is a birthday
    const initialText = // For correct grammar
      foundBirthdays.length === 1
        ? PERSONALITY.getPersonality().birthday.birthday
        : PERSONALITY.getPersonality().birthday.birthdays;

    const birthdayText = foundBirthdays.reduce(
      (acc, { userId, birthdayDate }) => {
        const birthdayYear = dayjs(birthdayDate).year();
        const currentAge =
          birthdayYear === dayjs().year() ? "" : today.year() - birthdayYear; // Age computation
        const text =
          currentAge === ""
            ? `${acc} <@${userId}> ♥ \n`
            : `${acc} <@${userId}> (${currentAge} ans) ♥ \n`;
        return text;
      },
      initialText,
    );
    await channelSend(channel, { content: birthdayText });
  }
};

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getPersonality().birthday.name)
  .setDescription(PERSONALITY.getPersonality().birthday.description)
  .addSubcommand((subcommand) =>
    subcommand //add subcommand
      .setName(PERSONALITY.getPersonality().birthday.add.name)
      .setDescription(PERSONALITY.getPersonality().birthday.add.description)
      .addIntegerOption((option) =>
        option
          .setName(PERSONALITY.getPersonality().birthday.add.dayOption.name)
          .setDescription(
            PERSONALITY.getPersonality().birthday.add.dayOption.description,
          )
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(31),
      )
      .addNumberOption((option) =>
        option
          .setName(PERSONALITY.getPersonality().birthday.add.monthOption.name)
          .setDescription(
            PERSONALITY.getPersonality().birthday.add.monthOption.description,
          )
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(12),
      )
      .addNumberOption((option) =>
        option
          .setName(PERSONALITY.getPersonality().birthday.add.yearOption.name)
          .setDescription(
            PERSONALITY.getPersonality().birthday.add.yearOption.description,
          )
          .setRequired(false)
          .setMinValue(dayjs().subtract(100, "year").year())
          .setMaxValue(dayjs().subtract(5, "year").year()),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand //remove subcommand
      .setName(PERSONALITY.getPersonality().birthday.remove.name)
      .setDescription(PERSONALITY.getPersonality().birthday.remove.description),
  )
  .addSubcommand((subcommand) =>
    subcommand //get subcommand
      .setName(PERSONALITY.getPersonality().birthday.get.name)
      .setDescription(PERSONALITY.getPersonality().birthday.get.description),
  );

const action = async (interaction) => {
  const authorId = interaction.member.id;
  const db = interaction.client.db;

  const whichCommand = interaction.options.getSubcommand();
  const bPerso = PERSONALITY.getPersonality().birthday;

  if (whichCommand === bPerso.remove.name) {
    // remove user
    if (isBirthdayDate(db, authorId)) {
      //if in db
      removeBirthday(db, authorId);
      await interactionReply(interaction, bPerso.removeUser);
    } else await interactionReply(interaction, bPerso.userNotFound);
    return;
  } else if (whichCommand === bPerso.add.name) {
    // add user
    const day = interaction.options
      .getInteger(bPerso.add.dayOption.name)
      .toString();
    const month = interaction.options
      .getNumber(bPerso.add.monthOption.name)
      .toString();
    const year = interaction.options.getNumber(bPerso.add.yearOption.name);

    const dayToAdd = day.length === 1 ? "0" + day : day;
    const monthToAdd = month.length === 1 ? "0" + month : month;
    const dateToAdd = year
      ? `${dayToAdd}-${monthToAdd}-${year}`
      : `${dayToAdd}-${monthToAdd}`;

    const date = dayjs(dateToAdd, ["DD-MM-YYYY", "DD-MM"]);
    if (date.isValid()) {
      //if date respect dayjs form
      addBirthday(db, authorId, date.toISOString()); //add to db
      await interactionReply(interaction, bPerso.addUser);
    } else await interactionReply(interaction, bPerso.parsingError);
  } else if (whichCommand === bPerso.get.name) {
    // checks if user is in DB and tells user
    const users = db.data.birthdaysUsers;
    const user = users.find(({ userId }) => userId === authorId);

    if (user)
      await interactionReply(
        interaction,
        `${bPerso.getUser}${dayjs(user.birthdayDate).format("DD/MM/YYYY")}.`,
      );
    else await interactionReply(interaction, bPerso.userNotFound);
  }
};

const birthday = {
  // Allows Ewibot to wish happy birthday to users willing to
  name: "birthday",
  command: command,
  action,
  help: (interaction, userOption) => {
    const personality = PERSONALITY.getPersonality().birthday;
    const helpToUse = userOption.includes(" ")
      ? personality[userOption.split(" ")[1]]
      : personality;
    interactionReply(interaction, helpToUse.help);
  },
  admin: false,
  releaseDate: null,
  sentinelle: false,
  subcommands: ["birthday", "birthday add", "birthday get", "birthday remove"],
};

export default birthday;
