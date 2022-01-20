import {
  addIgnoredUser,
  removeIgnoredUser,
  getIgnoredUsers,
} from "../helpers/index.js";

const helloWorld = {
  name: "helloWorld",
  trigger: "!helloWorld",
  action: async (message /* client */) => {
    await message.channel.send("hello, world !");
  },
  help: "Cette commande permet de dire bonjour",
};

const ignore = {
  name: "ignore",
  trigger: "!ignore",
  action: async (message, client) => {
    const db = client.db;
    console.log("DB", db);
    const authorId = message.author.id;
    if (getIgnoredUsers(db).includes(authorId)) {
      removeIgnoredUser(authorId, db);
      await message.channel.send("Je vais de nouveau réagir à vos messages.");
    } else {
      addIgnoredUser(authorId, db);
      await message.channel.send("Dorénavant je ne réagirai plus à vos message.");
    }
  },
  help: "Cette commande empêche ou non Ewibot de réagir à vos messages.",
};

const commands = [helloWorld, ignore];

const help = {
  name: "help",
  trigger: "!help",
  action: async (message) => {
    const words = message.content.split(" ");
    if (words.length === 1) {
      const helpText = commands.reduce(((acc, cur) => { return acc.concat(`\n- ${cur.name}`) }),
        `Cette commande permet d'afficher l'aide d'une commande. Pour obtenir l'aide \
d'une commande 'ex', tapez !help ex. \nPour le moment, les commandes suivantes ont été \
implémentées :\n- help`);
      await message.channel.send(helpText);
    }
    else {
      const command = commands.find(cmd => cmd.name === words[1]);
      if (command === undefined) {
        await message.channel.send(`La commande "${words[1]}" n'existe pas.`);
        return
      }
      await message.channel.send(command.help);
    }
  },
};

export default [...commands, help];
