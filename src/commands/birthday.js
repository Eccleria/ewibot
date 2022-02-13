import dayjs from "dayjs";
import CustomParseFormat from "dayjs/plugin/customParseFormat.js";
import "dayjs/locale/fr.js";

dayjs.locale("fr");
dayjs.extend(CustomParseFormat);

import {
  addBirthday,
  isbirthdayDate,
  removeBirthday,
  getBirthday,
  resetWished,
} from "../helpers/index.js";

const happyBirthday = async (db, channel) => {
  const today = dayjs().hour(8).minute(0).second(0).millisecond(0); // 8AM, local hour
  const users = db.data.birthdays.users;
  const foundBirthdays = users.filter(
    ({ birthdayDate }) => birthdayDate === today
  );

  if (foundBirthdays.length !== 0) {
    const birthdayText = foundBirthdays.reduce(
      (acc, { userId, birthdayDate }) => {
        const currentAge = today.year - dayjs(birthdayDate).year();

        return `${acc} <@${userId}> (${currentAge} ans)\n`;
      },
      "OWH ! Aujourd'hui on fete les anniversaires de : \n"
    );

    await channel.send(birthdayText);
  }
  db.data.birthdays.wishedToday = true;
  db.wasUpdated = true;

  birthdayTimeout(db, channel);
};

const resetWishedToday = (db) => {
  resetWished(db);
};

export const birthdayTimeout = (db, channel) => {
  const birthdays = getBirthday(db);
  const today = dayjs();
  let next = dayjs();
  if (birthdays.wishedToday) {
    next = next.add(1, "d").hour(8).minute(0).second(0).millisecond(0);
  } else {
    next = next.hour(8).minute(0).second(0).millisecond(0);
  }
  const reset = dayjs().add(1, "d").hour(0).minute(0).second(0);

  setTimeout(happyBirthday, next.diff(today), db, channel); // For wishing Happy Birthday
  setTimeout(resetWishedToday, reset.diff(today), db); // For wishToday reset

  if (!db.data.birthdays.initiated) {
    db.birthdayInitiated = true;
    db.wasUpdated = true;
  }
};

const birthday = {
  name: "birthday",
  action: async (message, client) => {
    const content = message.content;
    const authorId = message.author.id;
    const db = client.db;
    if (isbirthdayDate(authorId, db)) {
      removeBirthday(authorId, db);
      await message.reply("Je ne te souhaiterai plus ton anniversaire.");
      return;
    }
    const words = content.toLowerCase().split(" ");
    if (words[1]) {
      addBirthday(authorId, db, words[1]);
      await message.reply("Je te souhaiterai ton anniversaire.");
      if (getBirthday(db).wishedToday) {
        happyBirthday(db, message.channel);
      }
    }
  },
  help: "Cette commande me permet ou non de te souhaiter ton anniversaire.\n\
La date est à indiquer au format JJ/MM/AAAA.",
};

export default birthday;
