import {
  addIgnoredUser,
  removeIgnoredUser,
  getIgnoredUsers,
  addBirthday,
  isUserBirthday,
  removeBirthday,
} from "../helpers/index.js";

import reminder from "./reminder.js";

const helloWorld = {
  name: "ping",
  action: async (message) => {
    await message.channel.send("pong !");
  },
  help: "Cette commande n'a pas besoin de description",
};

const ignore = {
  name: "ignore",
  action: async (message, client) => {
    const db = client.db;
    console.log("DB", db);
    const authorId = message.author.id;
    if (getIgnoredUsers(db).includes(authorId)) {
      removeIgnoredUser(authorId, db);
      await message.channel.send("Je vais de nouveau réagir à tes messages.");
    } else {
      addIgnoredUser(authorId, db);
      await message.channel.send(
        "Dorénavant je ne réagirai plus à tes messages."
      );
    }
  },
  help: "Cette commande empêche ou non Ewibot de réagir à tes messages.",
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
    addBirthday(authorId, db, words[1]);
    await message.reply("Je te souhaiterai ton anniversaire.");
  },
  help: "Cette commande me permet ou non de te souhaiter ton anniversaire.\n\
La date est à indiquer au format JJ/MM/AAAA. L'année est optionnelle.",
};

const commands = [helloWorld, ignore, reminder, birthday];

const help = {
  name: "help",
  action: async (message) => {
    const words = message.content.split(" ");
    if (words.length === 1) {
      const baseText = `Cette commande permet d'afficher l'aide d'une commande. Pour obtenir l'aide \
d'une commande 'ex', tape $help ex. \nPour le moment, les commandes suivantes ont été \
implémentées :\n- help`;
      const helpText = commands.reduce((acc, cur) => {
        return acc.concat(`, ${cur.name}`);
      }, baseText);
      await message.channel.send(helpText);
    } else {
      const command = commands.find((cmd) => cmd.name === words[1]);
      if (!command) {
        return;
      }
      await message.channel.send(command.help);
    }
  },
};

export default [...commands, help];
