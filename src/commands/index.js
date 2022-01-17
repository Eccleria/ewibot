const helloWorld = {
  name: "hello world",
  trigger: "!hello",
  action: (message, client) => {
    console.log(message, client);
    message.channel.send("hello, world !");
  },
};

const help = {
  name: "help",
  trigger: "!help",
  action: (message) => {
    message.channel.send("commande d'aide, à venir");
  },
};

export default [helloWorld, help];
