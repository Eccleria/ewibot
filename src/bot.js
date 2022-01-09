//eslint-disable-next-line
require("dotenv").config();

import { Client, Intents } from "discord.js";

import { isApologies, isYoutubeLink } from "./helpers";
// Create an instance of a Discord client
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

const threadId = "926909785117429861";

const self = process.env.CLIENTID;

const onMessageHandler = async (message) => {
  const { channel, author, content } = message;
  // ignoring message from himself
  if (author.id === self) return;

  if (isApologies(content.toLowerCase())) {
    message.react("😄");
  }

  const thread = channel.isThread
    ? null
    : channel.threads.cache.find((x) => x.id === threadId);
  if (thread && thread.joinable) await thread.join();

  if (channel.id === threadId) {
    //
    const foundLink = isYoutubeLink(content);
    if (foundLink)
      message.reply(
        `lien trouvé et ajouté à la playlist: <${isYoutubeLink(content)}>`
      );
  }
};

// Create an event listener for messages
client.on("messageCreate", onMessageHandler);

client.once("ready", () => {
  console.log("I am ready!");
});

// Log our bot in using the token from https://discord.com/developers/applications
client.login(process.env.TOKEN);
