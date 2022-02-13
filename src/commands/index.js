import {
  isIgnoredChannel,
  removeIgnoredChannel,
  addIgnoredChannel,
} from "../helpers/dbHelper.js";
import {
  addIgnoredUser,
  removeIgnoredUser,
  getIgnoredUsers,
  isAdmin,
} from "../helpers/index.js";
import reminder from "./reminder.js";
import birthday from "./birthday.js";
import personnalities from "../personnalities.json";

const helloWorld = {
  name: "ping",
  action: async (message, personality) => {
    await message.channel.send(personality.helloWorld.pong);
  },
  help: () => {
    return personnalities.normal.commands.helloWorld.help;
  },
  admin: false,
};

const ignore = {
  name: "ignore",
  action: async (message, personality, client) => {
    const db = client.db;
    const authorId = message.author.id;
    if (getIgnoredUsers(db).includes(authorId)) {
      removeIgnoredUser(authorId, db);
      await message.channel.send(personality.ignore.notIgnored);
    } else {
      addIgnoredUser(authorId, db);
      await message.channel.send(personality.ignore.ignored);
    }
  },
  help: () => {
    return personnalities.normal.commands.ignore.help;
  },
  admin: false,
};

const ignoreChannel = {
  name: "ignoreChannel",
  action: async (message, personality, client) => {
    const db = client.db;
    const ignoredChannelId =
      message.content.toLowerCase().split(" ")[1] || message.channel.id;
    if (isIgnoredChannel(db, ignoredChannelId)) {
      removeIgnoredChannel(db, ignoredChannelId);
      await message.reply(
        personality.ignoreChannel.notIgnored.concat(`<#${ignoredChannelId}>.`)
      );
    } else {
      addIgnoredChannel(db, ignoredChannelId);
      await message.reply(
        personality.ignoreChannel.ignored.concat(`<#${ignoredChannelId}>.`)
      );
    }
  },
  help: () => {
    return personnalities.normal.commands.ignoreChannel.help;
  },
  admin: true,
};

const roll = {
  name: "roll",
  action: async (message) => {
    const args = message.content.toLowerCase().split(" ");
    const diceNumbers = args[1].split("d").map(nb => Number(nb));
    if (args[1] && diceNumbers[0] && diceNumbers[1]) {
      let total = 0;
      for (let i = 0; i < diceNumbers[0]; i++) {
        total += Math.round(diceNumbers[1] * Math.random()) + 1;
      }
      await message.reply(total.toString());
    }
    else {
      message.reply("Erreur de parsing");
    }
  },
  help: "Cette commande permet de renvoyer les résultats d'un jet de dés. Tapez \
_nombre de dés_ **d** _nombre de faces des dés_. \nEx pour 2 dés à 6 faces : $roll 2d6",
  admin: false,
}

const commands = [helloWorld, ignore, reminder, birthday, ignoreChannel, roll];

const help = {
  name: "help",
  action: async (message, personality) => {
    const words = message.content.split(" ");
    if (words.length === 1) {
      const baseText = personality.help.init;
      const helpText = commands.reduce((acc, cur) => {
        return `${cur.admin ? "_[admin]_ " : ""}${cur.name}, ${acc}`;
      }, "");
      await message.channel.send(`${baseText} - ${helpText.slice(0, -2)}`);
    } else {
      if (words[1] === "help") await message.channel.send(help.help());
      const command = commands.find(
        (cmd) => cmd.name === words[1]
      );
      if (!command || (!isAdmin(message.author.id) && command.admin)) {
        return;
      }
      await message.channel.send(command.help());
    }
  },
  help: () => {
    return personnalities.normal.commands.help.help;
  },
  admin: false,
};

export default [...commands, help];
