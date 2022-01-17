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

export default [helloWorld, help];
