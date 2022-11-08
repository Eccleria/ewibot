import { SlashCommandBuilder } from "@discordjs/builders";

import { interactionReply } from "./utils.js";
import { isGiftUser, addGiftUser, removeGiftUser } from "../helpers/index.js";
import { PERSONALITY } from "../personality.js";
import { addGiftMessage } from "../helpers/dbHelper.js";
import * as dayjs from "dayjs";

const sendGifts = (client) => {
  const db = client.db;
  const dbData = db.data.gift;

  //loop over accepting users
  dbData.users.forEach(async (userId) => {
    //get corresponding messages
    const data = dbData.messages.find((obj) => obj.userId === userId);
    const user = await client.users.fetch(userId);

    data.messages.forEach((message) => {
      setTimeout((message) => user.send(message), 2000, message);
    })
  })
};

export const nTimeOut = (client) => {
  const dDate = new Date(2022, 12, 25, 8); //date when to send
  const sendDate = new dayjs(dDate); //dayjs object
  const waitingTime = sendDate.difference(dayjs());

  setTimeout(sendGifts, waitingTime, client);
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
  //handle each subcommand
  if (subcommand === personality.use.name) {
    //use subcommand
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
