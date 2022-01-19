import {
  addIgnoredUser,
  removeIgnoredUser,
  getIgnoredUsers,
} from "../helpers/index.js";

const helloWorld = {
  name: "hello world",
  trigger: "!hello",
  action: async (message /* client */) => {
    await message.channel.send("hello, world !");
  },
  help: "une commande qui permet de dire bonjour",
};

const help = {
  name: "help",
  trigger: "!help",
  action: async (message) => {
    await message.channel.send("commande d'aide, à venir");
  },
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
      await message.channel.send("Je ne vous ignore plus");
    } else {
      addIgnoredUser(authorId, db);
      await message.channel.send("Dorénavant je vous ignore");
    }
  },
  help: "Une commande qui empêche Ewibot de réagir à vos messages",
};

export default [helloWorld, help, ignore];
