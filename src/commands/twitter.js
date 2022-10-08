import { SlashCommandBuilder } from "@discordjs/builders";

import {
  tweetCompare
 } from "../admin/twitter.js";
import {
  removeMissingTweets,
} from "../helpers/index.js";
import { PERSONALITY } from "../personality.js";

// jsons import
import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("static/commons.json"));

const command = new SlashCommandBuilder()
  .setName("twitter")
  .setDescription("Commandes de gestions du lien Twitter-Discord.")
  .setDefaultMemberPermissions(0x0000010000000000) //MODERATE_MEMBERS bitwise
  .addSubcommand((command) => 
    command
      .setName("compare")
      .setDescription("Compare les 5 derniers tweets avec la base de donnée et envoie la différence.")
  )
  .addSubcommand((command) =>
    command
      .setName("share")
      .setDescription("Partage les derniers tweets manquants au publique.")  
  );

const waitingTimeRadomizer = (mean, variation) => {
  const waitingTime = mean + (Math.random() - 0.5) * variation; //mean +/- variation random
  return Math.floor(waitingTime); //floor
};

const timeoutTweets = (tweetLink, waitingTime, channel, isLast, client) => {
  setTimeout(
    () => {
      channel.send({ content: tweetLink });
      removeMissingTweets(tweetLink, client.db);
      if (isLast) client.twitter.isSending = false;
    },
    waitingTime,
    isLast,
    client
  );
};

const action = async (interaction) => {

  const client = interaction.client;  //get client data
  const personality = PERSONALITY.getCommands().twitter; //get personality

  const options = interaction.options; //get interaction options
  const subcommand = options.getSubcommand();

  if (subcommand === "share") {
    const isSending = client.twitter.isSending;
    if (isSending) {
      //if already sending tweets, return
      interaction.reply({ content: personality.isSending, ephemeral: true });
      return;
    }
    const db = client.db;
    const missingTweets = db.data.twitter.missingTweets;

    //get prod channel where to send tweets
    const server = commons.find(({ name }) =>
      process.env.DEBUG === "yes" ? name === "test" : name === "prod"
    ); //get commons data
    const channelId = server.twitter.prodChannelId;
    const channel = await client.channels.fetch(channelId);

    const lenght = missingTweets.lenght;
    if (lenght === 0) {
      interaction.reply({ content: personality.noTweets, ephemeral: true });
      return;
    }

    missingTweets.reduce((acc, cur, idx) => {
      //compute new waiting time
      const curWaitingTime = waitingTimeRadomizer(2, 1) * 60 * 1000;
      const newAcc = acc + curWaitingTime; //sum waiting times
      console.log("newAcc", newAcc);
      const isLast = idx === lenght - 1; //compute if is last Tweet

      timeoutTweets(cur, newAcc, channel, isLast, client); //set tweet Timeout before send
      return newAcc; //return sum of waiting times
    }, 0);
    interaction.reply({
      content: personality.sendInProgress,
      ephemeral: true,
    });
    client.twitter.isSending = true;
    return;
  }
  else if (subcommand === "compare") {
    tweetCompare(client, interaction);
    return;
  }
};

const twitter = {
  action,
  command,
  help: (interaction) => {
    interaction.reply({
      content: PERSONALITY.getCommands().twitter.help,
      ephemeral: true,
    });
  },
  admin: true,
};

export default twitter;
