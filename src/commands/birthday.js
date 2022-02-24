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
import personnalities from "../personnalities.json";

const PERSONALITY = personnalities.normal;
const replies = PERSONALITY.commands.birthday;

export const wishBirthday = async (db, channel) => {
  const today = dayjs().hour(8).minute(0).second(0).millisecond(0); // 8AM, local hour
  const users = db.data.birthdaysUsers;

  const foundBirthdays = users.filter(({ birthdayDate }) => {
    const date = dayjs(birthdayDate);
    return date.month() === today.month() && date.date() === today.date();
  });

  if (foundBirthdays.length !== 0) {
    const birthdayText = foundBirthdays.reduce(
      (acc, { userId, birthdayDate }) => {
        const currentAge = today.year() - dayjs(birthdayDate).year();

        return `${acc} <@${userId}> (${currentAge} ans) ♥ \n`;
      },
      "OWH ! Aujourd'hui on fete les anniversaires de : \n"
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
    if (isBirthdayDate(authorId, db)) {
      removeBirthday(authorId, db);
      await message.reply(replies.removeUser);
      return;
    }
  } else if (words[1] === "add" && words[2]) {
    const date = dayjs(words[2], "DD-MM-YYYY");

    if (date.isValid()) {
      if (date.year() < 1950) {
        await message.reply(replies.tooOld);
      } else if (date.year() > dayjs().subtract(5, "year").year()) {
        await message.reply(replies.tooYoung);
      } else {
        addBirthday(authorId, db, date.toISOString());
        await message.reply(replies.addUser);
      }
    } else await message.reply(replies.parsingError);
  } else if (words.length === 1) {
    const users = db.data.birthdaysUsers;
    const user = users.find(({ userId }) => userId === authorId);

    if (user)
      await message.reply(
        `${replies.getUser}${dayjs(user.birthdayDate).format("DD/MM/YYYY")}.`
      );
    else await message.reply(replies.userNotFound);
  }
};

const birthday = {
  name: "birthday",
  action,
  help: () => {
    return replies.help;
  },
};

export default birthday;
