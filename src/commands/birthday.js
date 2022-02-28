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
import personalities from "../personalities.json";

export const wishBirthday = async (db, channel) => {
  const today = dayjs().hour(8).minute(0).second(0).millisecond(0); // 8AM, local hour
  const users = db.data.birthdaysUsers;

  const foundBirthdays = users.filter(({ birthdayDate }) => {
    const date = dayjs(birthdayDate);
    return date.month() === today.month() && date.date() === today.date();
  });

  if (foundBirthdays.length !== 0) {
    const initialText =
      foundBirthdays.length === 1
        ? "OWH ! Aujourd'hui on fête l'anniversaire de : \n"
        : "OWH ! Aujourd'hui on fête les anniversaires de : \n";
    const birthdayText = foundBirthdays.reduce(
      (acc, { userId, birthdayDate }) => {
        const currentAge = today.year() - dayjs(birthdayDate).year();

        return `${acc} <@${userId}> (${currentAge} ans) ♥ \n`;
      },
      initialText
    );
    await channel.send(birthdayText);
  }
};

const action = async (message, personality, client) => {
  const content = message.content;
  const authorId = message.author.id;
  const db = client.db;
  const words = content.toLowerCase().split(" ");

  if (words[1] && words[1] === "del") {
    if (isBirthdayDate(authorId, db)) {
      removeBirthday(authorId, db);
      await message.reply(personality.birthday.removeUser);
      return;
    }
  } else if (words[1] === "add" && words[2]) {

    const date = dayjs(words[2], "DD-MM-YYYY");

    if (date.isValid()) {
      if (date.year() < 1950) {
        await message.reply(personality.birthday.tooOld);
      } else if (date.year() > dayjs().subtract(5, "year").year()) {
        await message.reply(personality.birthday.tooYoung);
      } else {
        addBirthday(authorId, db, date.toISOString());
        await message.reply(personality.birthday.addUser);
      }
    } else await message.reply(personality.birthday.parsingError);
  } else if (words.length === 1) {
    const users = db.data.birthdaysUsers;
    const user = users.find(({ userId }) => userId === authorId);

    if (user)
      await message.reply(
        `${personality.birthday.getUser}${dayjs(user.birthdayDate).format("DD/MM/YYYY")}.`
      );
    else await message.reply(personality.birthday.userNotFound);
  }
};

const birthday = {
  name: "birthday",
  action,
  help: () => {
    return personalities.normal.commands.birthday.help;
  },
  admin: false
};

export default birthday;
