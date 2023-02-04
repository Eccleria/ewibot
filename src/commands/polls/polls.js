import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageEmbed } from "discord.js";
import { addPoll } from "../../helpers/index.js";
import { PERSONALITY } from "../../personality.js";
import { pollButtonCollector } from "./pollsCollectors.js";
import { createButton, interactionReply } from "../utils.js";
import { parsePollFields } from "./pollsUtils.js";

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getCommands().polls.name)
  .setDescription(PERSONALITY.getCommands().polls.description)
  .setDefaultMemberPermissions(0x0000010000000000)
  .addSubcommand((command) => 
    command //create
      .setName(PERSONALITY.getCommands().polls.create.name)
      .setDescription(PERSONALITY.getCommands().polls.create.description)
      .addStringOption((option) =>
        option //title
          .setName(PERSONALITY.getCommands().polls.titleOption.name)
          .setDescription(PERSONALITY.getCommands().polls.titleOption.description)
          .setRequired(true)
          .setMinLength(1)
          .setMaxLength(225)
      )
      .addStringOption((option) =>
        option //choice
          .setName(PERSONALITY.getCommands().polls.choiceOption.name)
          .setDescription(PERSONALITY.getCommands().polls.choiceOption.description)
          .setRequired(true)
          .setMinLength(4)
      )
      .addStringOption((option) =>
        option //description
          .setName(PERSONALITY.getCommands().polls.descOption.name)
          .setDescription(PERSONALITY.getCommands().polls.descOption.description)
          .setMinLength(1)
          .setMaxLength(4096)
      )
      .addBooleanOption((option) =>
        option //hide
          .setName(PERSONALITY.getCommands().polls.hideOption.name)
          .setDescription(PERSONALITY.getCommands().polls.hideOption.description)
          .setRequired(false)
      )
      .addStringOption((option) =>
        option //vote
          .setName(PERSONALITY.getCommands().polls.voteOption.name)
          .setDescription(PERSONALITY.getCommands().polls.voteOption.description)
          .setRequired(false)
          .addChoices(...PERSONALITY.getCommands().polls.voteOption.choices)
      )
      .addStringOption((option) =>
        option //color
          .setName(PERSONALITY.getCommands().polls.colorOption.name)
          .setDescription(PERSONALITY.getCommands().polls.colorOption.description)
          .setRequired(false)
          .addChoices(...PERSONALITY.getCommands().polls.colorOption.colors.choices)
      )
      .addNumberOption((option) =>
        option //maxVoteNumber
          .setName(PERSONALITY.getCommands().polls.maxOption.name)
          .setDescription(PERSONALITY.getCommands().polls.maxOption.description)
          .setRequired(false)
          .setMinValue(1)
      )
  )
  .addSubcommand((command) =>
    command
      .setName(PERSONALITY.getCommands().polls.addChoice.name)
      .setDescription(PERSONALITY.getCommands().polls.addChoice.description)
    
  );

const action = async (interaction) => {
  const options = interaction.options;
  const perso = PERSONALITY.getCommands().polls;

  if(options.getSubcommands(perso.create.name)) {
    //create poll subcommand
    //get options
    const title = options.getString(perso.titleOption.name);
    const choices = options.getString(perso.choiceOption.name);

    const description = options.getString(perso.descOption.name, false);

    let option = options.getBoolean(perso.hideOption.name, false); //anonymous
    const anonymous = option == null ? true : option; //if true, no name displayed

    option = options.getString(perso.voteOption.name, false); //voteType
    const voteType = option == null ? perso.voteOption.choices[0].value : option; //if true, only one vote

    option = options.getString(perso.colorOption.name, false); //color
    const color =
      option == null ? perso.colorOption.colors.choices[4].value : option;

    option = options.getNumber(perso.maxOption.name, false); //max
    const voteMax = option == null ? choices.split(";").length : option;

    //check if not too many choices
    const splited = choices.split(";");
    if (splited.length > 10) {
      interactionReply(interaction, perso.errorChoicesNumber);
      return;
    }

    //create embed
    const embed = new MessageEmbed()
      .setTitle(title)
      .setTimestamp()
      .setColor(color);

    //write footer according to voteType
    const footerText =
      voteType === perso.voteOption.choices[0].value
        ? perso.footer[voteType] + perso.footer.options
        : perso.footer[voteType] + ` (${voteMax})` + perso.footer.options;
    embed.setFooter({ text: footerText });

    // Optionnal parameters
    if (description) embed.setDescription(description);

    //parse choices text
    const results = parsePollFields(splited);

    //write choices in embed
    const black = perso.colorOption.black;
    results.fields.forEach((field) => {
      embed.addFields({ name: field, value: black.repeat(10) + " 0% (0)\n" });
    });

    //create vote buttons
    const components = results.emotes.reduce(
      (acc, cur, idx) => {
        const buttonId = "polls_" + idx.toString();
        const button = createButton(buttonId, null, "SECONDARY", cur);

        if (idx === 0 || acc.size === 5) {
          const newRow = new MessageActionRow().addComponents(button);
          return { actionRows: [...acc.actionRows, newRow], size: 1 };
        } else {
          const lastAR = acc.actionRows[acc.actionRows.length - 1];
          lastAR.addComponents(button);
          return { actionRows: acc.actionRows, size: acc.size + 1 };
        }
      },
      { actionRows: [], size: 0 }
    );

    //add setting button
    const settingId = "polls_" + "settings";
    const settingButton = createButton(settingId, null, "SECONDARY", "⚙️");
    if (components.size === 5) {
      //if actionRow is full, create one more
      const newRow = new MessageActionRow().addComponents(settingButton);
      components.actionRows.push(newRow);
    } else
      components.actionRows[components.actionRows.length - 1].addComponents(
        settingButton
      );

    //send poll
    const pollMsg = await interaction.channel.send({
      embeds: [embed],
      components: components.actionRows,
    });
    pollButtonCollector(pollMsg); //start listening to interactions
    interactionReply(interaction, perso.sent);

    //save poll
    const dbVotes = results.fields.reduce((acc) => {
      acc.push([]);
      return acc;
    }, []); //create db choice storage
    const colorIdx = perso.colorOption.colors.choices.findIndex(
      (obj) => obj.value === color
    ); //find color index from personality
    addPoll(
      interaction.client.db,
      pollMsg.id,
      interaction.user.id,
      dbVotes,
      anonymous,
      voteType,
      colorIdx,
      voteMax
    ); //add to db
  }
};

const polls = {
  action,
  command,
  help: (interaction) => {
    const personality = PERSONALITY.getCommands().polls;
    interactionReply(interaction, personality.help);
  },
  admin: true,
  releaseDate: null,
  sentinelle: true,
};

export default polls;
