import { SlashCommandBuilder } from "@discordjs/builders";

import { PERSONALITY } from "../personality.js";
import { removeMissingTweets } from "../helpers/index.js";
// jsons import
import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("static/commons.json"));

const command = new SlashCommandBuilder()
  .setName("twitter")
  .setDescription("Commandes de gestions du lien Twitter-Discord.")
  .setDefaultMemberPermissions(0)/*
  .addSubcommand((command) => 
    command
      .setName("checktweets")
      .setDescription("Compare les derniers tweets avec la base de donnée et envoie la différence.")
  )
  .addSubcommand((command) =>
    command
      .setName("status")
      .setDescription("Indique le status de la connexion avec Twitter.")
)*/
  .addSubcommand((command) =>
    command
      .setName("confirm-init")
      .setDescription("Confirme l'envoi des derniers tweets manquants.")
    );

const waitingTimeRadomizer = (mean, variation) => {
  const waitingTime = mean + (Math.random() - 0.5) * variation; //mean +/- variation random
  return Math.floor(waitingTime); //floor
};

const timeoutTweets = (tweetLink, oldWaitingTime, channel, isLast, client) => {
  const waitingTime = waitingTimeRadomizer(5, 2); //in minutes
  const waitingTimeMs = oldWaitingTime + waitingTime * 60 * 1000; //in ms
  setTimeout(() => {
    channel.send({ content: tweetLink });
    if (isLast) {
      client.isSending = false;
      removeMissingTweets()
    }
  }, waitingTimeMs, isLast, client);
  return waitingTimeMs
}

const action = async (interaction) => {
  const client = interaction.client;
  //const twitter = client.twitter;
  //const stream = twitter.stream;
  const personality = PERSONALITY.getCommands().twitter;

  const options = interaction.options; //get interaction options
  const subcommand = options.getSubcommand();
  //const subcommandGroup = options.getSubcommandGroup();

  //console.log("subcommandGroup", subcommandGroup);
  console.log("subcommand", subcommand);

  if (subcommand === "confirm-init") {
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

    missingTweets.reduce((acc, cur, idx) => {
      //compute new waiting time
      const curWaitingTime = waitingTimeRadomizer(5, 2) * 60 * 1000; 
      const newAcc = acc + curWaitingTime; //sum waiting times
      console.log("newAcc", newAcc);
      const isLast = idx === lenght - 1; //compute if is last Tweet

      timeoutTweets(cur, newAcc, channel, isLast, client); //set tweet Timeout before send
      return newAcc; //return sum of waiting times
    }, 0);
    interaction.reply({
      content: personality.sendInProgress, ephemeral: true
    });
    client.isSending = true;
  }
};

const twitter = {
  action,
  command,
  help: (interaction) => {
    interaction.reply({ content: PERSONALITY.getCommands().twitter.help, ephemeral: true })
  },
  admin: true,
};

export default twitter;