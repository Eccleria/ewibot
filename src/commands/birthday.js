import dayjs from "dayjs";
import CustomParseFormat from "dayjs/plugin/customParseFormat.js";
import "dayjs/locale/fr.js";
dayjs.locale("fr");
dayjs.extend(CustomParseFormat);

import { SlashCommandBuilder } from "@discordjs/builders";

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
  .setName("birthday")
  .setDescription("Permet de modifier votre profil d'anniversaire.")
  .addSubcommand((command) =>
    command
      .setName("ajouter")
      .setDescription("Ajouter/modifier votre date de naissance.")
      .addIntegerOption((option) =>
        option
          .setName("jour")
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(31)
      )
      .addIntegerOption((option) =>
        option
          .setName("mois")
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(12)
      )
      .addNumberOption((option) =>
        option
          .setName("année")
          .setRequired(false)
          .setMinValue(dayjs().subtract(100, "year").year())
          .setMaxValue(dayjs().subtract(5, "year").year())
      )
  )
  .addSubcommand((command) =>
    command
      .setName("retirer")
      .setDescription("Retirer votre date de naissance")
  )
  .addSubcommand((command) =>
    command
      .setName("voir")
      .setDescription("Voir votre date d'anniverssaire enregistrée.")
  );

const action = async (interaction) => {
  const authorId = interaction.member.id;
  const db = interaction.client.db;

  const whichCommand = interaction.options;
  console.log("whichCommand", whichCommand);

  const words = content.toLowerCase().split(" ");

  if (words[1] && words[1] === "del") {
    // remove user
    if (isBirthdayDate(authorId, db)) {
      removeBirthday(authorId, db);
      await interaction.reply(personality.removeUser);
      return;
    }
  } else if (words[1] === "add" && words[2]) {
    // add user
    const date = dayjs(words[2], ["DD-MM-YYYY", "DD-MM"]);
    if (date.isValid()) {
      // Checks date validity
      if (date.year() < 1950) {
        // If too old
        await interaction.reply(personality.tooOld);
      } else if (
        date.year() > dayjs().subtract(5, "year").year() &&
        date.year() !== dayjs().year()
      ) {
        // If year of birth > now year - 5 => too young
        await interaction.reply(personality.tooYoung);
      } else {
        addBirthday(authorId, db, date.toISOString());
        await interaction.reply(personality.addUser);
      }
    } else await interaction.reply(personality.parsingError);
  } else if (words.length === 1) {
    // checks if user is in DB and tells user
    const users = db.data.birthdaysUsers;
    const user = users.find(({ userId }) => userId === authorId);

    if (user)
      await interaction.reply(
        `${personality.getUser}${dayjs(
          user.birthdayDate
        ).format("DD/MM/YYYY")}.`
      );
    else await interaction.reply(personality.userNotFound);
  }
};

const birthday = {
  // Allows Ewibot to wish happy birthday to users willing to
  name: "birthday",
  command: command,
  action,
  help: () => {
    return personality.help;
  },
  admin: false,
};

export default birthday;
