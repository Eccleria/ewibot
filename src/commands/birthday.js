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
} from "../helpers/index.js";

export const wishBirthday = async (db, channel) => {
  const today = dayjs().hour(8).minute(0).second(0).millisecond(0); // 8AM, local hour
  const users = db.data.birthdays.users;

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

const birthday = {
  name: "birthday",
  action: async (message, client) => {
    const content = message.content;
    const authorId = message.author.id;
    const db = client.db;

    const words = content.toLowerCase().split(" ");

    if (words[1] && words[1] === "del") {
      if (isbirthdayDate(authorId, db)) {
        removeBirthday(authorId, db);
        await message.reply("Je ne te souhaiterai plus ton anniversaire.");
        return;
      }
    } else if (words[1] === "add" && words[2]) {
      const date = dayjs(words[2], "DD-MM-YYYY")
        .hour(8)
        .minute(0)
        .second(0)
        .millisecond(0); // 8AM, local hour

      if (date.isValid()) {
        addBirthday(authorId, db, date.toISOString());
        await message.reply("Je te souhaiterai ton anniversaire.");
      } else await message.reply("Erreur de parsing dans la date");
    } else if (words.length === 1) {
      const birthdays = getBirthday(db).users;
      const user = birthdays.find(({ userId }) => userId === authorId);

      if (user)
        await message.reply(
          `Ton anniversaire est le ${dayjs(user.birthdayDate).format(
            "DD/MM/YYYY"
          )}`
        );
      else
        await message.reply(
          "Pas d'anniversaire stocké dans la base de données pour toi"
        );
    }
  },
  help: "Cette commande me permet ou non de te souhaiter ton anniversaire.\n Utilisation : \n\
  `$birthday add DD/MM/YYYY` pour ajouter ou modifier ta date\n\
  `$birthday del` pour supprimer ta date \n\
  `$birthday` pour afficher ta date d'anniversaire (des fois que tu l'aies oubliée ...)",
};

export default birthday;
