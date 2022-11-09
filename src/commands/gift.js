import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow } from "discord.js";

import { interactionReply, createButton } from "./utils.js";
import { isGiftUser, addGiftUser, removeGiftUser } from "../helpers/index.js";
import { PERSONALITY } from "../personality.js";
import { addGiftMessage, isMessageRecipient, removeGiftMessage } from "../helpers/index.js";
import * as dayjs from "dayjs";

//jsons import
import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("static/commons.json"));

export const giftButtonHandler = async (interaction) => {
  //get db data
  const client = interaction.client;
  const db = client.db;
  const dbData = db.data.gift;

  //loop over accepting users
  dbData.users.forEach(async (userId) => {
    //get corresponding messages 
    const data = dbData.messages;
    const user = await client.users.fetch(userId);

    await user.send(PERSONALITY.getCommands().gift.delivery);
    data.messages.forEach((message) => {
      setTimeout(async (message) => await user.send(message), 2000, message);
    });
  });
};

const giftInteractionCreation = async (client, commons) => {
  // handle the interaction creation once nTimeout is finished

  //get commons data
  const server = commons.find(({ name }) =>
    process.env.DEBUG === "yes" ? name === "test" : name === "prod"
  );
  const guild = await client.guilds.fetch(server.guildId);
  const channel = await guild.channels.fetch(server.giftChannelId);

  const actionRow = new MessageActionRow().addComponents(
    createButton("gift", PERSONALITY.getCommands().gift.buttonLabel, "PRIMARY")
  );

  channel.send({ content: "Yo", components: [actionRow] });
}

export const nTimeOut = (client, commons) => {
  // setup Timeout before n-Surprise day
  const dDate = new Date(2022, 12, 25, 8); //date when to send
  const sendDate = new dayjs(dDate); //dayjs object
  const waitingTime = sendDate.difference(dayjs());
  console.log("waitingTime", waitingTime);

  setTimeout(giftInteractionCreation, waitingTime, client, commons);
};

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getCommands().gift.name)
  .setDescription(PERSONALITY.getCommands().gift.description)
  .setDefaultMemberPermissions(0x0000010000000000) //MODERATE_MEMBERS bitwise
  .addSubcommand(
    (
      subcommand //user authorisation command
    ) =>
      subcommand
        .setName(PERSONALITY.getCommands().gift.use.name)
        .setDescription(PERSONALITY.getCommands().gift.use.description)
  )
  .addSubcommand(
    (
      subcommand //send message command
    ) =>
      subcommand
        .setName(PERSONALITY.getCommands().gift.send.name)
        .setDescription(PERSONALITY.getCommands().gift.send.description)
        .addUserOption((option) =>
          option
            .setName(PERSONALITY.getCommands().gift.send.userOption.name)
            .setDescription(
              PERSONALITY.getCommands().gift.send.userOption.description
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName(PERSONALITY.getCommands().gift.send.textOption.name)
            .setDescription(
              PERSONALITY.getCommands().gift.send.textOption.description
            )
            .setRequired(true)
        )
  )
  .addSubcommand((subcommand) =>
    subcommand //remove
      .setName(PERSONALITY.getCommands().gift.remove.name)
      .setDescription(PERSONALITY.getCommands().gift.remove.description)
      .addUserOption((option) =>
        option
          .setName(PERSONALITY.getCommands().gift.remove.userOption.name)
          .setDescription(
            PERSONALITY.getCommands().gift.remove.userOption.description
          )
          .setRequired(true)
      )
  );

const action = async (interaction) => {
  //get interaction data
  const options = interaction.options;
  const subcommand = options.getSubcommand();
  const author = interaction.member;
  const db = interaction.client.db;

  //get personality
  const personality = PERSONALITY.getCommands().gift;
  const send = personality.send;
  const remove = personality.remove;

  //handle each subcommand
  if (subcommand === personality.use.name) {
    //use subcommand
    giftInteractionCreation(interaction.client, commons);
    if (isGiftUser(db, author.id)) {
      removeGiftUser(db, author.id);
      interactionReply(interaction, personality.use.isNotAccepting);
    } else {
      addGiftUser(db, author.id);
      interactionReply(interaction, personality.use.isAccepting);
    }
  } else if (subcommand === send.name) {
    //send subcommand
    const giftData = db.data.gift;
    const acceptingUsers = giftData.users;
    const targetUser = options.getUser(send.userOption.name);
    const targetId = targetUser.id;

    //check for appropriate user selection
    if (!acceptingUsers.includes(targetId))
      interactionReply(interaction, send.isNotAccepting);
    else {
      //correct user
      const content = options.getString(send.textOption.name); //get gift content
      addGiftMessage(db, targetId, content, author.id); //add to db
      interactionReply(interaction, send.saved);
    }
  } else if (subcommand === personality.remove.name) {
    //remove subcommand
    const targetUser = options.getUser(remove.userOption.name);
    const targetId = targetUser.id;

    //check for appropriate user selection
    if (!isMessageRecipient(db, targetId))
      interactionReply(interaction, remove.hasNoMessage);
    else {
      //correct user
      const content = removeGiftMessage(db, targetId, author.id); //remove from db
      console.log("content", content);
      if (content) {
        // is list
        if (content.length !== 0) {
          // if has messages
          await interactionReply(interaction, remove.removed);
          content.forEach(async (text) => await interaction.followUp({ content: text, ephemeral: true }));
          interaction.followUp({ content: remove.sendAgain, ephemeral: true });
        } else interactionReply(interaction, remove.hasNoMessage);
      }
    }
  }
};

const gift = {
  action,
  command,
  help: (interaction) => {
    const personality = PERSONALITY.getCommands().gift;
    interactionReply(interaction, personality.help);
  },
};

export default gift;
