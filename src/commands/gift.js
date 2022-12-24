import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageEmbed } from "discord.js";

import { interactionReply, createButton } from "./utils.js";
import {
  isGiftUser,
  addGiftUser,
  removeGiftUser,
  getGiftMessage,
} from "../helpers/index.js";
import { PERSONALITY } from "../personality.js";
import { addGiftMessage, removeGiftMessage } from "../helpers/index.js";
import dayjs from "dayjs";

//jsons import
import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("static/commons.json"));

export const giftButtonHandler = async (interaction) => {
  // handle user clicking on gift button
  //get db data
  const client = interaction.client;
  const db = client.db;
  const dbData = db.data.gift;

  const personality = PERSONALITY.getCommands().gift;
  const authorId = interaction.user.id;

  if (isGiftUser(db, authorId)) {
    //if is accepting user
    const userData = dbData.messages.find((obj) => obj.userId === authorId);
    const messages = userData ? userData.messages : [];

    if (messages.length !== 0) {
      await interactionReply(interaction, personality.delivery);
      messages.forEach(async (obj) => {
        //get corresponding messages
        setTimeout(
          async (text) =>
            await interaction.followUp({ content: text, ephemeral: true }),
          2000,
          obj.message
        ); //send messages every 2s
      });
      return;
    }
  }
  interactionReply(interaction, personality.compensation);
};

const giftInteractionCreation = async (client) => {
  // handle the interaction creation once giftRecursiveTimeout is finished
  //get commons data
  const server = commons.find(({ name }) =>
    process.env.DEBUG === "yes" ? name === "test" : name === "prod"
  );
  const guild = await client.guilds.fetch(server.guildId);
  const channel = await guild.channels.fetch(server.giftButtonChannelId);

  const personality = PERSONALITY.getCommands().gift;

  //create button
  const actionRow = new MessageActionRow().addComponents(
    createButton("gift", personality.buttonLabel, "PRIMARY")
  );

  const nDayEmbed = personality.nDayEmbed;
  const embed = new MessageEmbed() //create embed
    .setColor("DARK_GREEN")
    .setTimestamp()
    .setTitle(personality.nDayEmbed.title)
    .setDescription(nDayEmbed.description)
    .addFields({ name: nDayEmbed.noteName, value: nDayEmbed.noteText })
    .setImage(
      "https://cdn.discordapp.com/attachments/1040335601330831420/1047879588220514394/image.png"
    );

  //create message and send it
  channel.send({ embeds: [embed], components: [actionRow] });
};

export const setGiftTimeoutLoop = (client) => {
  // setup Timeout before n-Surprise day
  const dDate = dayjs(new Date(2022, 11, 25, 1)); //date when to send

  const tomorrowMidnight = dayjs()
    .add(1, "day")
    .hour(0)
    .minute(0)
    .second(0)
    .millisecond(0); //tomorrow @ midnight

  const timeToMidnight = tomorrowMidnight.diff(dayjs());
  const dayMs = 86400000;

  const sendMessage = () => {
    const today = dayjs();
    if (dDate.month() === today.month() && dDate.date() === today.date()) {
      // send the gifts
      giftInteractionCreation(client);
    }
  };

  setTimeout(() => {
    sendMessage();
    setInterval(() => {
      sendMessage();
    }, dayMs);
  }, timeToMidnight);
};

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getCommands().gift.name)
  .setDescription(PERSONALITY.getCommands().gift.description)
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
          .setRequired(false)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand //get
      .setName(PERSONALITY.getCommands().gift.get.name)
      .setDescription(PERSONALITY.getCommands().gift.get.description)
      .addUserOption((option) =>
        option
          .setName(PERSONALITY.getCommands().gift.get.userOption.name)
          .setDescription(
            PERSONALITY.getCommands().gift.get.userOption.description
          )
          .setRequired(false)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand //accepting
      .setName(PERSONALITY.getCommands().gift.accepting.name)
      .setDescription(PERSONALITY.getCommands().gift.accepting.description)
      .addUserOption((option) =>
        option
          .setName(PERSONALITY.getCommands().gift.accepting.userOption.name)
          .setDescription(
            PERSONALITY.getCommands().gift.accepting.userOption.description
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
  const get = personality.get;

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
  } else if (subcommand === personality.remove.name) {
    //remove subcommand
    const targetUser = options.getUser(remove.userOption.name, false);
    const dbResults = targetUser
      ? removeGiftMessage(db, author.id, targetUser.id)
      : removeGiftMessage(db, author.id);

    if (dbResults && dbResults.length !== 0) {
      //is not null && is not empty list
      await interactionReply(interaction, remove.removed);

      dbResults.forEach(async (obj) => {
        //typeof obj can be "string" or "object"
        const userId = typeof obj === "object" ? obj.recipientId : targetUser.id;
        const name = remove.for + `<@${userId}>`;
        const userState = isGiftUser(db, userId)
          ? remove.accept
          : remove.notAccept;

        const messages = typeof obj === "object" ? obj.messages.reduce(
          (acc, cur) => acc + remove.separator + cur,
          ""
        ) : obj; //concat messages

        await interaction.followUp({
          content: name + userState + messages,
          ephemeral: true,
        });
      });

    } else interactionReply(interaction, remove.noMessage);
  } else if (subcommand === personality.get.name) {
    //get subcommand
    const recipient = options.getUser(get.userOption.name, false);
    const dbResult = recipient
      ? getGiftMessage(db, author.id, recipient.id)
      : getGiftMessage(db, author.id); // [{recipient, messages}, ...]

    if (dbResult.length !== 0) {
      await interactionReply(interaction, get.hasMessages);
      dbResult.forEach(async (obj) => {
        const userId = obj.recipientId;
        const name = get.for + `<@${userId}>`;
        const userState = isGiftUser(db, userId) ? get.accept : get.notAccept;

        const messages = obj.messages.reduce(
          (acc, cur) => acc + get.separator + cur,
          ""
        ); //concat messages
        await interaction.followUp({
          content: name + userState + messages,
          ephemeral: true,
        });
      });
    } else interactionReply(interaction, get.noMessage);
  } else if (subcommand === personality.accepting.name) {
    //accepting subcommand
    const recipient = options.getUser(get.userOption.name, false);
    const accepting = personality.accepting;
    const content = accepting.user + `<@${recipient.id}>`;

    if (isGiftUser(db, recipient.id))
      interactionReply(interaction, content + accepting.accept);
    else interactionReply(interaction, content + accepting.notAccept);
  }
};

const gift = {
  action,
  command,
  help: (interaction, userOption) => {
    const personality = PERSONALITY.getCommands().gift;
    const helpToUse = userOption.includes(" ")
      ? personality[userOption.split(" ")[1]]
      : personality;
    interactionReply(interaction, helpToUse.help);
  },
  admin: false,
  releaseDate: dayjs("12-01-2022", "MM-DD-YYYY"),
  sentinelle: false,
  subcommands: [
    "gift",
    "gift use",
    "gift send",
    "gift remove",
    "gift get",
    "gift accepting",
  ],
};

export default gift;
