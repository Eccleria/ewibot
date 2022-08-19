import dayjs from "dayjs";
import CustomParseFormat from "dayjs/plugin/customParseFormat.js";
import "dayjs/locale/fr.js";
dayjs.locale("fr");
dayjs.extend(CustomParseFormat);

import { SlashCommandBuilder } from "@discordjs/builders";

import { interactionReply } from "./utils.js";
import {
  addBirthday,
  isBirthdayDate,
  removeBirthday,
} from "../helpers/index.js";
import { PERSONALITY } from "../personality.js";

const personality = PERSONALITY.getCommands().birthday;

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
        ? PERSONALITY.getCommands().birthday.birthday
        : PERSONALITY.getCommands().birthday.birthdays;

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
      initialText
    );
    await channel.send(birthdayText);
  }
};

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getCommands().birthday.name)
  .setDescription(PERSONALITY.getCommands().birthday.description)
  .addSubcommand((subcommand) =>
    subcommand //add subcommand
      .setName(PERSONALITY.getCommands().birthday.add.name)
      .setDescription(PERSONALITY.getCommands().birthday.add.description)
      .addIntegerOption((option) =>
        option
          .setName(PERSONALITY.getCommands().birthday.add.dayOption.name)
          .setDescription(
            PERSONALITY.getCommands().birthday.add.dayOption.description
          )
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(31)
      )
      .addNumberOption((option) =>
        option
          .setName(PERSONALITY.getCommands().birthday.add.monthOption.name)
          .setDescription(
            PERSONALITY.getCommands().birthday.add.monthOption.description
          )
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(12)
      )
      .addNumberOption((option) =>
        option
          .setName(PERSONALITY.getCommands().birthday.add.yearOption.name)
          .setDescription(
            PERSONALITY.getCommands().birthday.add.yearOption.description
          )
          .setRequired(false)
          .setMinValue(dayjs().subtract(100, "year").year())
          .setMaxValue(dayjs().subtract(5, "year").year())
      )
  )
  .addSubcommand((subcommand) =>
    subcommand //remove subcommand
      .setName(PERSONALITY.getCommands().birthday.remove.name)
      .setDescription(PERSONALITY.getCommands().birthday.remove.description)
  )
  .addSubcommand((subcommand) =>
    subcommand //get subcommand
      .setName(PERSONALITY.getCommands().birthday.get.name)
      .setDescription(PERSONALITY.getCommands().birthday.get.description)
  );

const action = async (interaction, type) => {
  const authorId = interaction.member.id;
  const db = interaction.client.db;

  let whichCommand;
  let words = null;
  if (type === "/") whichCommand = interaction.options.getSubcommand();
  else if (type === "$") {
    words = interaction.content.split(" ");
    whichCommand = words.length > 1 ? words[1] : null;
  }

  const bPerso = PERSONALITY.getCommands().birthday;

  if (whichCommand === bPerso.remove.name) {
    // remove user
    if (isBirthdayDate(authorId, db)) {
      //if in db
      removeBirthday(authorId, db);
      await interactionReply(interaction, bPerso.removeUser);
    } else await interactionReply(interaction, bPerso.userNotFound);
    return;
  } else if (whichCommand === bPerso.add.name) {
    // add user
    let dateToAdd;
    if (type === "/") {
      const day = interaction.options
        .getInteger(bPerso.add.dayOption.name)
        .toString();
      const month = interaction.options
        .getNumber(bPerso.add.monthOption.name)
        .toString();
      const year = interaction.options.getNumber(bPerso.add.yearOption.name);

      const dayToAdd = day.length === 1 ? "0" + day : day;
      const monthToAdd = month.length === 1 ? "0" + month : month;
      dateToAdd = year
        ? `${dayToAdd}-${monthToAdd}-${year}`
        : `${dayToAdd}-${monthToAdd}`;
    } else if (type === "$") dateToAdd = words[2];

    const date = dayjs(dateToAdd, ["DD-MM-YYYY", "DD-MM"]);
    if (date.isValid()) {
      //if date respect dayjs form
      if (type === "$") {
        // Checks date validity
        const message = interaction;
        if (date.year() < 1950) {
          // If too old
          await message.reply(bPerso.tooOld);
        } else if (
          date.year() > dayjs().subtract(5, "year").year() &&
          date.year() !== dayjs().year()
        ) {
          // If year of birth > now year - 5 => too young
          await message.reply(bPerso.tooYoung);
        } else {
          addBirthday(authorId, db, date.toISOString());
          await message.reply(bPerso.addUser);
        }
      } else if (type === "/") {
        addBirthday(authorId, db, date.toISOString()); //add to db
        await interactionReply(interaction, bPerso.addUser);
      }
    } else await interactionReply(interaction, bPerso.parsingError);
  } else if (whichCommand === bPerso.get.name) {
    // checks if user is in DB and tells user
    const users = db.data.birthdaysUsers;
    const user = users.find(({ userId }) => userId === authorId);

    if (user)
      await interactionReply(
        interaction,
        `${bPerso.getUser}${dayjs(user.birthdayDate).format("DD/MM/YYYY")}.`
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
    const personality = PERSONALITY.getCommands().birthday;
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
