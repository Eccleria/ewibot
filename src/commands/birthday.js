import dayjs from "dayjs";
import "dayjs/locale/fr.js";
import {
  addBirthday,
  isUserBirthday,
  removeBirthday,
  getBirthday,
} from "../helpers/index.js";

const happyBirthday = async (db, channel) => {
  const now = dayjs();
  const birthdayUsers = db.data.birthdays.birthdayUsers;
  const foundBirthdays = birthdayUsers.filter(({ userBirthday }) => {
    let day = now.date();
    let month = now.month();
    if (day <= 9) day = "0" + day.toString();
    if (month >= 9) month = (month + 1).toString();
    if (month < 9) month = "0" + (month + 1).toString();
    return (
      userBirthday.slice(0, 2) === day && userBirthday.slice(3, 5) === month
    );
  });

  if (foundBirthdays) {
    const birthdayText = foundBirthdays.reduce((acc, cur) => {
      acc = acc.concat(`<@${cur.userId}>`, " ");
      if (cur.userBirthday.length >= 6)
        acc = acc.concat(
          `(${
            now.year() - Number(cur.userBirthday.slice(6, 10)).toString()
          } ans)`
        );
      return acc;
    }, "Joyeux anniversaire ");

    await channel.send(birthdayText.concat(" !"));
  }
  db.data.birthdays.wishedToday = true;
  db.wasUpdated = true;

  birthdayTimeout(db, channel);
};

const resetWishedToday = (db) => {
  db.data.birthdays.wishedToday = false;
  db.wasUpdated = true;
};

export const birthdayTimeout = (db, channel) => {
  const birthdays = getBirthday(db);
  const now = dayjs();
  let next = dayjs();
  if (birthdays.wishedToday) {
    next = next.add(1, "d").hour(8).minute(0).second(0).millisecond(0);
  } else {
    next = next.hour(8).minute(0).second(0).millisecond(0);
  }
  const reset = dayjs().add(1, "d").hour(0).minute(0).second(0);

  setTimeout(happyBirthday, next.diff(now), db, channel); // For wishing Happy Birthday
  setTimeout(resetWishedToday, reset.diff(now), db); // For wishToday reset

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
    if (isUserBirthday(authorId, db)) {
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
La date est à indiquer au format JJ/MM/AAAA. L'année est optionnelle.",
};

export default birthday;
