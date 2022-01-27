import {
  addIgnoredUser,
  removeIgnoredUser,
  getIgnoredUsers,
} from "../helpers/index.js";

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

const reminder = {
  name: "reminder",
  action: async (message, client) => {
    const { channel, content, author } = message;
    const words = content.toLowerCase().split(" ");
    if (words.length < 2) {
      const removed = client.remindme.splice(
        client.remindme.findIndex((element) => element.authorId === author.id),
        1
      );
      clearTimeout(removed[0].timeout);
      await message.channel.send("Le reminder a été supprimé.");
      return;
    }
    const wordTiming = words[1];
    let timing = 0;
    for (let i = 2, j = 0; i >= 0; i--, j += 3) {
      timing += parseInt(wordTiming.slice(j, j + 2)) * 60 ** i;
      console.log(timing);
    }
    timing *= 1000;
    const timeoutObj = setTimeout(async () => {
      await channel.send(content.slice(19));
    }, timing);
    client.remindme.push({
      authorId: author.id,
      timeout: timeoutObj,
    });
    await message.channel.send("Le reminder a été créé.");
  },
  help: "Première version. Tapez $reminder --h--m-- *contenu* pour \
avoir un rappel du bot avec le *contenu* au bout de la durée indiquée.",
};

const commands = [helloWorld, ignore, reminder];

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
