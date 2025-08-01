import dayjs from "dayjs";
import { SlashCommandBuilder } from "@discordjs/builders";
import { ActionRowBuilder, EmbedBuilder, ButtonStyle } from "discord.js";
import { pollButtonCollector } from "./pollsCollectors.js";
import { parsePollFields, stopPoll } from "./pollsUtils.js";
import { createButton } from "../utils.js";
import {
  addPoll,
  addPollChoices,
  getPollFromTitle,
  getPollsTitles,
  interactionReply,
} from "../../helpers/index.js";
import { COMMONS } from "../../commons.js";
import { PERSONALITY } from "../../personality.js";

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getPersonality().polls.name)
  .setDescription(PERSONALITY.getPersonality().polls.description)
  //.setDefaultMemberPermissions(0x0000010000000000)
  .addSubcommand((command) =>
    command //create
      .setName(PERSONALITY.getPersonality().polls.create.name)
      .setDescription(PERSONALITY.getPersonality().polls.create.description)
      .addStringOption((option) =>
        option //title
          .setName(PERSONALITY.getPersonality().polls.create.titleOption.name)
          .setDescription(
            PERSONALITY.getPersonality().polls.create.titleOption.description,
          )
          .setRequired(true)
          .setMinLength(1)
          .setMaxLength(225),
      )
      .addStringOption((option) =>
        option //choice
          .setName(PERSONALITY.getPersonality().polls.create.choiceOption.name)
          .setDescription(
            PERSONALITY.getPersonality().polls.create.choiceOption.description,
          )
          .setRequired(true)
          .setMinLength(4),
      )
      .addStringOption((option) =>
        option //description
          .setName(PERSONALITY.getPersonality().polls.create.descOption.name)
          .setDescription(
            PERSONALITY.getPersonality().polls.create.descOption.description,
          )
          .setMinLength(1)
          .setMaxLength(4096),
      )
      .addBooleanOption((option) =>
        option //hide
          .setName(PERSONALITY.getPersonality().polls.create.hideOption.name)
          .setDescription(
            PERSONALITY.getPersonality().polls.create.hideOption.description,
          )
          .setRequired(false),
      )
      .addStringOption((option) =>
        option //color
          .setName(PERSONALITY.getPersonality().polls.create.colorOption.name)
          .setDescription(
            PERSONALITY.getPersonality().polls.create.colorOption.description,
          )
          .setRequired(false)
          .addChoices(...PERSONALITY.getColors().choices),
      )
      .addNumberOption((option) =>
        option //maxVoteNumber
          .setName(PERSONALITY.getPersonality().polls.create.maxOption.name)
          .setDescription(
            PERSONALITY.getPersonality().polls.create.maxOption.description,
          )
          .setRequired(false)
          .setMinValue(1),
      )
      .addUserOption((option) =>
        option //author
          .setName(PERSONALITY.getPersonality().polls.create.authorOption.name)
          .setDescription(
            PERSONALITY.getPersonality().polls.create.authorOption.description,
          )
          .setRequired(false),
      )
      .addNumberOption((option) =>
        option //hour
          .setName(PERSONALITY.getPersonality().polls.create.hourOption.name)
          .setDescription(
            PERSONALITY.getPersonality().polls.create.hourOption.description,
          )
          .setRequired(false)
          .setMaxValue(99)
          .setMinValue(0),
      )
      .addNumberOption((option) =>
        option //minutes
          .setName(PERSONALITY.getPersonality().polls.create.minuteOption.name)
          .setDescription(
            PERSONALITY.getPersonality().polls.create.minuteOption.description,
          )
          .setRequired(false)
          .setMaxValue(99)
          .setMinValue(0),
      ),
  )
  .addSubcommand((command) =>
    command //add choice
      .setName(PERSONALITY.getPersonality().polls.addChoice.name)
      .setDescription(PERSONALITY.getPersonality().polls.addChoice.description)
      .addStringOption((option) =>
        option //poll
          .setName(PERSONALITY.getPersonality().polls.addChoice.pollOption.name)
          .setDescription(
            PERSONALITY.getPersonality().polls.addChoice.pollOption.description,
          )
          .setRequired(true)
          .setAutocomplete(true),
      )
      .addStringOption((option) =>
        option //choice
          .setName(
            PERSONALITY.getPersonality().polls.addChoice.choiceOption.name,
          )
          .setDescription(
            PERSONALITY.getPersonality().polls.addChoice.choiceOption
              .description,
          )
          .setRequired(true)
          .setMinLength(4),
      ),
  )
  .addSubcommand((command) =>
    command //stop poll
      .setName(PERSONALITY.getPersonality().polls.stop.name)
      .setDescription(PERSONALITY.getPersonality().polls.stop.description)
      .addStringOption((option) =>
        option
          .setName(PERSONALITY.getPersonality().polls.stop.pollOption.name)
          .setDescription(
            PERSONALITY.getPersonality().polls.stop.pollOption.description,
          )
          .setRequired(true)
          .setAutocomplete(true),
      ),
  );

const action = async (interaction) => {
  console.log("polls command");
  const options = interaction.options;
  const personality = PERSONALITY.getPersonality().polls;
  const subcommand = options.getSubcommand();

  //check for alavirien.ne role
  const guildMember = await interaction.member.fetch();
  const currentServer = COMMONS.fetchFromGuildId(interaction.guildId);
  if (!guildMember.roles.cache.has(currentServer.alavirienRoleId)) {
    interactionReply(interaction, personality.errorNotAlavirien);
    return;
  }

  if (subcommand === personality.create.name) {
    //create poll subcommand
    const perso = personality.create;
    const pColors = PERSONALITY.getColors();

    //get options
    const title = options.getString(perso.titleOption.name);
    const choices = options.getString(perso.choiceOption.name);
    const description = options.getString(perso.descOption.name, false);

    let option = options.getBoolean(perso.hideOption.name, false); //anonymous
    const anonymous = option == null ? true : option; //if true, no name displayed

    option = options.getNumber(perso.maxOption.name, false); //max
    const voteMax = option == null ? 1 : option;

    option = options.getString(perso.colorOption.name, false); //color
    const color = option == null ? pColors.choices[2].value : option;

    const author = options.getUser(perso.authorOption.name, false); //author

    option = options.getNumber(perso.hourOption.name, false); //hours
    const hours = option == null ? 0 : option;
    option = options.getNumber(perso.minuteOption.name, false); //minutes
    const minutes = option == null ? 0 : option;
    let timeout = (hours * 60 + minutes) * 60 * 1000; //poll duration in miliseconds
    if (timeout === 0) timeout = 48 * 60 * 60 * 1000; //2 days default value
    const pollDate = dayjs().millisecond(timeout);

    //check choices length restrictions
    const splited = choices.split(";");
    if (splited.length > 10) {
      //if not too many choices
      interactionReply(interaction, personality.errorChoicesNumber);
      return;
    }
    for (const item of splited) {
      //if any choice is too long
      if (item.length > 256) {
        console.log("polls choice too long: ", item.length);
        interactionReply(interaction, personality.errorChoicesLength);
        return;
      }
    }

    //create embed
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setTimestamp()
      .setColor(color);

    //add author if any
    if (author)
      embed.setAuthor({ name: author.username, iconURL: author.avatarURL() });

    //write footer according to voteMax
    const voteFooter =
      voteMax === 1
        ? perso.footer.unique
        : perso.footer.multiple + ` (${voteMax})`;
    const footerText = voteFooter + perso.footer.options;
    embed.setFooter({ text: footerText });

    // Optionnal parameters
    if (description) embed.setDescription(description);

    //parse choices text
    const results = parsePollFields(splited);

    //write choices in embed
    const black = personality.black;
    results.fields.forEach((field, idx) => {
      const name = results.emotes[idx] + " " + field;
      embed.addFields({ name, value: black.repeat(10) + " 0% (0)\n" });
    });

    //create vote buttons
    const components = results.emotes.reduce(
      (acc, cur, idx) => {
        //create button
        const buttonId = "polls_" + idx.toString();
        const button = createButton(buttonId, null, ButtonStyle.Secondary, cur);
        const newDbVotesValue = { votes: [], buttonId: buttonId }; //create db choice storage

        //handle actionRow maxe size of 5 components.
        if (idx === 0 || acc.size === 5) {
          //if first button or last AR is full
          const newRow = new ActionRowBuilder().addComponents(button);
          return {
            actionRows: [...acc.actionRows, newRow],
            size: 1,
            dbVotes: [...acc.dbVotes, newDbVotesValue],
          };
        } else {
          //add button to last AR
          const lastAR = acc.actionRows[acc.actionRows.length - 1];
          lastAR.addComponents(button);
          return {
            actionRows: acc.actionRows,
            size: acc.size + 1,
            dbVotes: [...acc.dbVotes, newDbVotesValue],
          };
        }
      },
      { actionRows: [], size: 0, dbVotes: [] },
    );

    //add setting button
    const settingId = personality.prefix + perso.settings;
    const settingButton = createButton(
      settingId,
      null,
      ButtonStyle.Secondary,
      "⚙️",
    );
    if (components.size === 5) {
      //if actionRow is full, create one more
      const newRow = new ActionRowBuilder().addComponents(settingButton);
      components.actionRows.push(newRow);
    } else
      components.actionRows[components.actionRows.length - 1].addComponents(
        settingButton,
      );

    //add timeout embed
    const timeoutEmbed = new EmbedBuilder().setColor(color);
    timeoutEmbed.addFields({
      name: perso.timeout,
      value: `<t:${pollDate.unix()}:F> soit <t:${pollDate.unix()}:R>`,
    });

    //send poll
    try {
      const pollMsg = await interaction.channel.send({
        embeds: [embed, timeoutEmbed],
        components: components.actionRows,
      });
      pollButtonCollector(pollMsg, timeout); //start listening to interactions
      interactionReply(interaction, perso.sent);

      //save poll
      const colorIdx = pColors.choices.findIndex((obj) => obj.value === color); //find color index from personality
      addPoll(
        interaction.client.db,
        pollMsg.id,
        pollMsg.channelId,
        interaction.user.id,
        components.dbVotes,
        anonymous,
        colorIdx,
        voteMax,
        title,
        pollDate.toISOString(),
      ); //add to db

      //set 1h reminder
      if (timeout >= 7200000) {
        setTimeout(
          (message) => {
            const perso = PERSONALITY.getPersonality().polls;
            message.reply(perso.create.reminder);
          },
          timeout - 3600000,
          pollMsg,
        );
      }
    } catch (e) {
      console.log("/polls create error\n", e);
    }
  } else if (subcommand === personality.addChoice.name) {
    //addChoice poll subcommand
    const perso = personality.addChoice;

    //get options
    const pollInput = options.getString(perso.pollOption.name);
    const choices = options.getString(perso.choiceOption.name);

    //check if not too many choices
    const splited = choices.split(";");
    if (splited.length > 10) {
      interactionReply(interaction, personality.errorChoicesNumber);
      return;
    }

    //fetch db data
    const dbPoll = getPollFromTitle(interaction.client.db, pollInput);
    if (!dbPoll) {
      interactionReply(interaction, perso.errorNoPoll);
      return;
    }

    //get pollMessage
    const pollMessage = await interaction.channel.messages.fetch(dbPoll.pollId);
    const embed = EmbedBuilder.from(pollMessage.embeds[0]);
    const fields = embed.data.fields;

    //check for choices number
    if (fields.length + splited.length > 10) {
      interactionReply(interaction, perso.errorChoicesNumber);
      return;
    }

    //get total choices size
    const oldComponents = pollMessage.components; //get old components
    const lastAR = oldComponents[oldComponents.length - 1]; //last action row, with settings button
    const totalSize =
      (oldComponents.length - 1) * 5 + lastAR.components.length - 1; //total number of buttons

    //add to embed
    const results = parsePollFields(splited, totalSize);
    const black = personality.black;
    results.fields.forEach((field, idx) => {
      const name = results.emotes[idx] + " " + field;
      embed.addFields({ name, value: black.repeat(10) + " 0% (0)\n" });
    });

    //create new vote buttons + regroup with olders
    const settingButton = lastAR.components[lastAR.components.length - 1]; //get settings button
    const lastARsliced = ActionRowBuilder.from(lastAR);
    lastARsliced.components.splice(-1, 1);

    const voteAR = [...oldComponents.slice(0, -1), lastARsliced]; //filter actionRows
    const initComponents = {
      actionRows: voteAR,
      size: voteAR[voteAR.length - 1].components.length,
      dbVotes: [],
    }; //init for reduce
    const newComponents = results.emotes.reduce((acc, cur, idx) => {
      const totalIdx = idx + totalSize;
      const buttonId = "polls_" + totalIdx.toString();
      const button = createButton(buttonId, null, ButtonStyle.Secondary, cur);
      const newDbVotesValue = { votes: [], buttonId: buttonId }; //create db choice storage

      if (acc.size === 5) {
        const newRow = new ActionRowBuilder().addComponents(button);
        return {
          actionRows: [...acc.actionRows, newRow],
          size: 1,
          dbVotes: [...acc.dbVotes, newDbVotesValue],
        };
      } else {
        const lastAR = acc.actionRows[acc.actionRows.length - 1];
        lastAR.addComponents(button);
        return {
          actionRows: acc.actionRows,
          size: acc.size + 1,
          dbVotes: [...acc.dbVotes, newDbVotesValue],
        };
      }
    }, initComponents);

    //add again settingsButton
    if (newComponents.size === 5) {
      //if actionRow is full, create one more
      const newRow = new ActionRowBuilder().addComponents(settingButton);
      newComponents.actionRows.push(newRow);
    } else
      newComponents.actionRows[
        newComponents.actionRows.length - 1
      ].addComponents(settingButton);

    //edit original data
    const payload = { embeds: [embed, ...pollMessage.embeds.slice(1)] };
    payload.components = newComponents.actionRows;
    pollMessage.edit(payload); //edit message
    addPollChoices(
      interaction.client.db,
      pollMessage.id,
      newComponents.dbVotes,
    ); //edit db
    interactionReply(interaction, perso.updated);
  } else if (subcommand === personality.stop.name) {
    //stop poll subcommand
    const perso = personality.stop;
    const db = interaction.client.db;

    //get options
    const pollInput = options.getString(perso.pollOption.name);

    //fetch db data
    const dbPoll = getPollFromTitle(db, pollInput);
    if (!dbPoll) {
      interactionReply(interaction, perso.errorNoPoll);
      return;
    }

    //get pollMessage
    const channel = await interaction.client.channels.fetch(dbPoll.channelId);
    const pollMessage = await channel.messages.fetch(dbPoll.pollId);

    await stopPoll(dbPoll, pollMessage, personality);

    //return
    interactionReply(interaction, perso.stopped);
  }
};

const autocomplete = (interaction) => {
  const focusedValue = interaction.options.getFocused(); //get value which is currently user edited

  const dbData = getPollsTitles(interaction.client.db);
  const filtered = dbData.filter((title) => title.startsWith(focusedValue)); //filter to corresponding commands names
  const sliced = filtered.length > 24 ? filtered.slice(0, 24) : filtered;

  interaction.respond(
    sliced.map((choice) => ({ name: choice, value: choice })),
  );
};

const polls = {
  action,
  autocomplete,
  command,
  help: (interaction, userOption) => {
    const personality = PERSONALITY.getPersonality().polls;
    const helpToUse = userOption.includes(" ")
      ? personality[userOption.split(" ")[1]]
      : personality;
    interactionReply(interaction, helpToUse.help);
  },
  admin: false,
  releaseDate: null,
  sentinelle: false,
  subcommands: ["polls", "polls create", "polls addChoice"],
};

export default polls;
