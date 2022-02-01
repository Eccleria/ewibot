import {
  isIgnoredChannel,
  removeIgnoredChannel,
  addIgnoredChannel
} from "../helpers/dbHelper.js";
import {
  addIgnoredUser,
  removeIgnoredUser,
  getIgnoredUsers,
  isAdmin,
} from "../helpers/index.js";
import reminder from "./reminder.js";

const helloWorld = {
  name: "ping",
  action: async (message) => {
    if (helloWorld.admin) if (!isAdmin(message.author.id)) return;
    await message.channel.send("pong !");
  },
  help: "Cette commande n'a pas besoin de description",
  admin: false
};

const ignore = {
  name: "ignore",
  action: async (message, client) => {
    if (ignore.admin) if (!isAdmin(message.author.id)) return;
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
  admin: false
};

const ignoreChannel = {
  name: "ignoreChannel",
  action: async (message, client) => {
    if (ignoreChannel.admin) if (!isAdmin(message.author.id)) {
      return;
    }
    const db = client.db;
    const args = message.content.toLowerCase().split(" ");
    console.log(args)
    if (isIgnoredChannel(db, args[1])) {
      removeIgnoredChannel(db, args[1]);
      await message.reply(`Je vais de nouveau interagir avec les messages dans <#${args[1]}>.`);
    }
    else {
      addIgnoredChannel(db, args[1]);
      await message.reply(`Je n'interagirai plus avec les messages dans <#${args[1]}>.`);
    }
  },
  help: "en construction",
  admin: true
};

const commands = [helloWorld, ignore, reminder, ignoreChannel];

const help = {
  name: "help",
  action: async (message) => {
    if (help.admin) if (!isAdmin(message.author.id)) return;
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
  admin: false
};

export default [...commands, help];
