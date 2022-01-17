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

const ingore = {
  name: "ignore",
  trigger: "!ignore",
  action: async (message /* client */) => {
    await message.channel.send("ignored");
  },
  help: "une commande qui empêche le bot de réagir à vos phrases",
};

export default [helloWorld, help, ignore];
