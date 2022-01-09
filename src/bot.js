//eslint-disable-next-line
require("dotenv").config();

import Discord from "discord.js";

// import { isCommand } from "./helpers";
// Create an instance of a Discord client
const client = new Discord.Client();

const self = process.env.CLIENTID;

const onMessageHandler = async (message) => {
  const { channel, author, content } = message;
  // ignoring message from himself
  console.log(channel.threads);

  if (!channel.threads) {
    const chann = await channel.fetch();
    console.log(chann);
  }
  if (author.id === self) return;
};

// Create an event listener for messages
client.on("message", onMessageHandler);

client.on("ready", () => {
  console.log("I am ready!");
});

// Log our bot in using the token from https://discord.com/developers/applications
client.login(process.env.TOKEN);
