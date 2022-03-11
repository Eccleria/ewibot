import dayjs from "dayjs";
import CustomParseFormat from "dayjs/plugin/customParseFormat.js";
import "dayjs/locale/fr.js";
dayjs.locale("fr");
dayjs.extend(CustomParseFormat);

import {
  addBirthday,
  isBirthdayDate,
  removeBirthday,
} from "../helpers/index.js";
import { PERSONALITY } from "./personality.js";

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
        ? "OWH ! Aujourd'hui on fête l'anniversaire de : \n"
        : "OWH ! Aujourd'hui on fête les anniversaires de : \n";

    const birthdayText = foundBirthdays.reduce(
      (acc, { userId, birthdayDate }) => {
        const currentAge = today.year() - dayjs(birthdayDate).year(); // Age computation
        return `${acc} <@${userId}> (${currentAge} ans) ♥ \n`;
      },
      initialText
    );
    await channel.send(birthdayText);
  }
};

const action = async (message, client) => {
  const content = message.content;
  const authorId = message.author.id;
  const db = client.db;
  const words = content.toLowerCase().split(" ");

  if (words[1] && words[1] === "del") {
    // remove user
    if (isBirthdayDate(authorId, db)) {
      removeBirthday(authorId, db);
      await message.reply(PERSONALITY.getCommands().birthday.removeUser);
      return;
    }
  } else if (words[1] === "add" && words[2]) {
    // add user
    const date = dayjs(words[2], "DD-MM-YYYY");

    if (date.isValid()) {
      // Checks date validity
      if (date.year() < 1950) {
        // If too old
        await message.reply(PERSONALITY.getCommands().birthday.tooOld);
      } else if (date.year() > dayjs().subtract(5, "year").year()) {
        // If year of birth > now year - 5 => too young
        await message.reply(PERSONALITY.getCommands().birthday.tooYoung);
      } else {
        addBirthday(authorId, db, date.toISOString());
        await message.reply(PERSONALITY.getCommands().birthday.addUser);
      }
    } else await message.reply(PERSONALITY.getCommands().birthday.parsingError);
  } else if (words.length === 1) {
    // checks if user is in DB and tells user
    const users = db.data.birthdaysUsers;
    const user = users.find(({ userId }) => userId === authorId);

    if (user)
      await message.reply(
        `${PERSONALITY.getCommands().birthday.getUser}${dayjs(
          user.birthdayDate
        ).format("DD/MM/YYYY")}.`
      );
    else await message.reply(PERSONALITY.getCommands().birthday.userNotFound);
  }
};

const birthday = {
  // Allows Ewibot to wish happy birthday to users willing to
  name: "birthday",
  action,
  help: () => {
    return PERSONALITY.getCommands().birthday.help;
  },
  admin: false,
};

export default birthday;
