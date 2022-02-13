import {
  isIgnoredChannel,
  removeIgnoredChannel,
  addIgnoredChannel,
} from "../helpers/dbHelper.js";
import {
  addIgnoredUser,
  removeIgnoredUser,
  getIgnoredUsers,
} from "../helpers/index.js";
import reminder from "./reminder.js";
import birthday from "./birthday.js";

const helloWorld = {
  name: "ping",
  action: async (message) => {
    await message.channel.send("pong !");
  },
  help: "Cette commande n'a pas besoin de description",
  admin: false,
};

const ignore = {
  name: "ignore",
  action: async (message, client) => {
    const db = client.db;
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
  admin: false,
};

const ignoreChannel = {
  name: "ignoreChannel",
  action: async (message, client) => {
    const db = client.db;
    const ignoredChannelId =
      message.content.toLowerCase().split(" ")[1] || message.channel.id;
    if (isIgnoredChannel(db, ignoredChannelId)) {
      removeIgnoredChannel(db, ignoredChannelId);
      await message.reply(
        `Je n'ignorerai plus les messages de <#${ignoredChannelId}>.`
      );
    } else {
      addIgnoredChannel(db, ignoredChannelId);
      await message.reply(
        `Je vais ignorer les messages de <#${ignoredChannelId}>.`
      );
    }
  },
  help: "en construction",
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
  action: async (message) => {
    const words = message.content.split(" ");
    if (words.length === 1) {
      const baseText = `Cette commande permet d'afficher l'aide d'une commande. Pour obtenir l'aide \
d'une commande 'ex', tape $help ex. \nPour le moment, les commandes suivantes ont été \
implémentées :\n- help`;
      const helpText = commands.reduce((acc, cur) => {
        return acc.concat(`, ${cur.admin ? "_[admin]_ " : ""}${cur.name}`);
      }, baseText);
      await message.channel.send(helpText);
    } else {
      const command = commands.find(
        (cmd) => !cmd.admin && cmd.name === words[1]
      );
      if (!command) {
        return;
      }
      await message.channel.send(command.help);
    }
  },
  help: "Utilisez seulement $help",
  admin: false,
};

export default [...commands, help];
