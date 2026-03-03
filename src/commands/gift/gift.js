import dayjs from "dayjs";
import { SlashCommandBuilder } from "@discordjs/builders";
import {
  ActionRowBuilder,
  EmbedBuilder,
  ButtonStyle,
  Colors,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  TextDisplayBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import {
  channelSend,
  fetchChannel,
  fetchGuild,
  interactionReply,
} from "ewilib";

import { createButton } from "../utils.js";
import {
  addGiftSeparator,
  addGiftUser,
  getGiftMessage,
  getGiftUsers,
  isGiftUser,
  removeGiftMessage,
  removeGiftUser,
} from "../../helpers/index.js";
import { COMMONS } from "../../classes/commons.js";
import { PERSONALITY } from "../../classes/personality.js";

export const giftButtonHandler = async (interaction) => {
  // handle user clicking on gift button
  //get db data
  const { client, customId } = interaction;
  const db = client.db;
  const dbData = db.data.gift;

  const personality = PERSONALITY.getPersonality().gift;
  const authorId = interaction.user.id;

  //filter older buttons
  const today = dayjs();
  if (
    !customId.includes(today.year().toString()) &&
    !(
      today.date() < 15 &&
      today.month() === 0 &&
      customId.includes((today.year() - 1).toString())
    )
  ) {
    console.log("wrong gift button", interaction.customId);
    interactionReply(interaction, "Bouton trop vieux.");
    return;
  }

  //check for date
  if (today.month() !== 11 && today.month() !== 0 && today.date() > 7) {
    interactionReply(interaction, personality.tooLate);
    return;
  }

  //handle commands
  if (isGiftUser(db, authorId)) {
    //if is accepting user
    const userData = dbData.messages.find((obj) => obj.userId === authorId);
    const messages = userData ? userData.messages : [];

    if (messages.length !== 0) {
      await interactionReply(interaction, personality.delivery);
      messages.reduce((_acc, obj, idx) => {
        //get corresponding messages
        setTimeout(
          (text) =>
            interaction.followUp({
              content: text,
              flags: MessageFlags.Ephemeral,
            }),
          (idx + 1) * 1000,
          obj.message,
        ); //send messages every 2s
      }, null);
      return;
    }
  }
  interactionReply(interaction, personality.compensation);
};

const giftInteractionCreation = async (client, type) => {
  // handle the interaction creation once giftRecursiveTimeout is finished
  //get commons data
  const server =
    process.env.DEBUG === "yes" ? COMMONS.getTest() : COMMONS.getProd(); //get commons data

  const guild = await fetchGuild(client, server.guildId);
  const channel = await fetchChannel(
    guild.channels,
    server.giftButtonChannelId,
  );

  const personality = PERSONALITY.getPersonality().gift;

  //create button
  const thisYear = dayjs().year().toString();
  const actionRow = new ActionRowBuilder().addComponents(
    createButton(
      "gift_" + thisYear,
      personality.buttonLabel,
      ButtonStyle.Primary,
    ),
  );

  if (type === "xmas") {
    const nDayEmbed = personality.nDayEmbed;
    const embed = new EmbedBuilder() //create embed
      .setColor(Colors.DarkGreen)
      .setTimestamp()
      .setTitle(personality.nDayEmbed.title)
      .setDescription(nDayEmbed.description)
      .addFields({ name: nDayEmbed.noteName, value: nDayEmbed.noteText });

    //create message and send it
    channelSend(channel, { embeds: [embed], components: [actionRow] });
  } else if (type === "ny") {
    const newYear = personality.newYear;

    const embed = new EmbedBuilder() //create embed
      .setColor(Colors.DarkGreen)
      .setTimestamp()
      .setTitle(newYear.title)
      .setDescription(newYear.description);

    channelSend(channel, { embeds: [embed], components: [actionRow] });
  }
};

const addSeparationToDb = (client) => {
  const perso = PERSONALITY.getPersonality().gift.newYear;
  addGiftSeparator(client.db, perso.separator);
  console.log("Separation added to gift db");
};

export const setGiftTimeoutLoop = (client) => {
  // setup Timeout before n-Surprise day
  const xmasDate = dayjs(new Date(2025, 11, 25, 1)); //xmas date when to send
  const nyDate = dayjs(new Date(2026, 0, 1, 1)); //new year date
  const switchDate = dayjs(new Date(2025, 11, 27, 1)); //add separator to messages

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
    if (
      xmasDate.month() === today.month() &&
      xmasDate.date() === today.date()
    ) {
      // send the gifts
      giftInteractionCreation(client, "xmas");
    } else if (
      nyDate.month() === today.month() &&
      nyDate.date() === today.date()
    ) {
      giftInteractionCreation(client, "ny");
    } else if (
      switchDate.month() === today.month() &&
      switchDate.date() === today.date()
    ) {
      addSeparationToDb(client);
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
  .setName(PERSONALITY.getPersonality().gift.name)
  .setDescription(PERSONALITY.getPersonality().gift.description)
  .addSubcommand((subcommand) =>
    subcommand //user authorisation command
      .setName(PERSONALITY.getPersonality().gift.use.name)
      .setDescription(PERSONALITY.getPersonality().gift.use.description),
  )
  .addSubcommand((subcommand) =>
    subcommand //send message command
      .setName(PERSONALITY.getPersonality().gift.send.name)
      .setDescription(PERSONALITY.getPersonality().gift.send.description)
      .addUserOption((option) =>
        option
          .setName(PERSONALITY.getPersonality().gift.send.userOption.name)
          .setDescription(
            PERSONALITY.getPersonality().gift.send.userOption.description,
          )
          .setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand //remove
      .setName(PERSONALITY.getPersonality().gift.remove.name)
      .setDescription(PERSONALITY.getPersonality().gift.remove.description)
      .addUserOption((option) =>
        option
          .setName(PERSONALITY.getPersonality().gift.remove.userOption.name)
          .setDescription(
            PERSONALITY.getPersonality().gift.remove.userOption.description,
          )
          .setRequired(false),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand //get
      .setName(PERSONALITY.getPersonality().gift.get.name)
      .setDescription(PERSONALITY.getPersonality().gift.get.description)
      .addUserOption((option) =>
        option
          .setName(PERSONALITY.getPersonality().gift.get.userOption.name)
          .setDescription(
            PERSONALITY.getPersonality().gift.get.userOption.description,
          )
          .setRequired(false),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand //accepting
      .setName(PERSONALITY.getPersonality().gift.accepting.name)
      .setDescription(PERSONALITY.getPersonality().gift.accepting.description)
      .addUserOption((option) =>
        option
          .setName(PERSONALITY.getPersonality().gift.accepting.userOption.name)
          .setDescription(
            PERSONALITY.getPersonality().gift.accepting.userOption.description,
          )
          .setRequired(false),
      ),
  );

const action = async (interaction) => {
  //get interaction data
  const options = interaction.options;
  const subcommand = options.getSubcommand();
  const author = interaction.member;
  const db = interaction.client.db;

  //get personality
  const personality = PERSONALITY.getPersonality().gift;
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
      //build modal
      const mPerso = send.modal;
      const text = mPerso.text;
      const textDisplay = new TextDisplayBuilder().setContent(text);

      const textInput = new TextInputBuilder()
        .setCustomId(mPerso.textInput.customId)
        .setPlaceholder(mPerso.textInput.placeholder)
        .setMinLength(1)
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const label = new LabelBuilder()
        .setLabel(mPerso.textInput.label)
        .setTextInputComponent(textInput);

      const modalCustomId = mPerso.customId + `_id=${targetId}`;
      const modal = new ModalBuilder()
        .setTitle(mPerso.title)
        .setCustomId(modalCustomId)
        .addTextDisplayComponents(textDisplay)
        .addLabelComponents(label);

      console.log("Showing gift modal to ", author.id);
      try {
        interaction.showModal(modal);
      } catch (e) {
        console.error(e);
      }
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

      for (const obj of dbResults) {
        //typeof obj can be "string" or "object"
        const userId =
          typeof obj === "object" ? obj.recipientId : targetUser.id;
        const name = remove.for + `<@${userId}>`;
        const userState = isGiftUser(db, userId)
          ? remove.accept
          : remove.notAccept;

        const embed = new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription(name + userState);

        await interaction.followUp({
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });

        for (const message of obj.messages) {
          await interaction.followUp({
            content: message,
            flags: MessageFlags.Ephemeral,
          });
        }
      }
    } else interactionReply(interaction, remove.noMessage);
  } else if (subcommand === personality.get.name) {
    //get subcommand
    const recipient = options.getUser(get.userOption.name, false);
    const dbResult = recipient
      ? getGiftMessage(db, author.id, recipient.id)
      : getGiftMessage(db, author.id); // [{recipient, messages}, ...]

    if (dbResult.length !== 0) {
      await interactionReply(interaction, get.hasMessages);
      for (const obj of dbResult) {
        const userId = obj.recipientId;
        const name = get.for + `<@${userId}>`;
        const userState = isGiftUser(db, userId) ? get.accept : get.notAccept;

        const embed = new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription(name + userState);

        await interaction.followUp({
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });

        await obj.messages.forEach(async (message) => {
          await interaction.followUp({
            content: message,
            flags: MessageFlags.Ephemeral,
          });
        });
      }
    } else interactionReply(interaction, get.noMessage);
  } else if (subcommand === personality.accepting.name) {
    //accepting subcommand
    const recipient = options.getUser(get.userOption.name, false);
    const accepting = personality.accepting;
    let content;

    //if recipient is given
    if (recipient) {
      content = accepting.user + `<@${recipient.id}>`;

      if (isGiftUser(db, recipient.id))
        interactionReply(interaction, content + accepting.accept);
      else interactionReply(interaction, content + accepting.notAccept);
    } else {
      const users = getGiftUsers(db);
      const usersText = users.map((id) => `\n<@${id}>`);
      content = accepting.users + usersText;
      interactionReply(interaction, content + accepting.accepts);
    }
  }
};

const gift = {
  action,
  command,
  help: (interaction, userOption) => {
    const personality = PERSONALITY.getPersonality().gift;
    const helpToUse = userOption.includes(" ")
      ? personality[userOption.split(" ")[1]]
      : personality;
    interactionReply(interaction, helpToUse.help);
  },
  admin: false,
  releaseDate: dayjs("12-01-2023", "MM-DD-YYYY"),
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
