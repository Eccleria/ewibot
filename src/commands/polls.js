import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageEmbed } from "discord.js";
//import { removeEmote } from "../admin/utils";
import { PERSONALITY } from "../personality.js";
import {createButton, interactionReply} from "./utils.js";

export const pollsButtonHandler = (interaction) => {
  // Dispatch button action to corresponding functions
  if (typeof Number(interaction.customId[6]) == "number") voteButtonHandler(interaction); 
};

const voteButtonHandler = (interaction) => {
  // count vote, update db + embed
  const { customId } = interaction;

  const id = Number(customId.slice(6)); //field id to add 1
  const pollEmbed = interaction.message.embeds[0];
  const fields = pollEmbed.fields;

  //update fields[id]
  //get number values for each field
  const fieldNumbers = fields.reduce((acc, cur) => {
    //"emotes ...*% (no)"
    const splited = cur.value.split(" ");
    const ratio = Number(splited[1].slice(0, -1));
    const value = Number(splited[2].slice(1, -1));
    return {values: [...acc.values, value], ratio: [...acc.ratios, ratio]};
  }, {values: [], ratios: []})
  /*
  const voteField = fields[id]; //get field
  const splited1 = voteField.value.split("("); //split to get value
  const splited2 = splited1[1].split(")"); //value to add 1 vote
  const newValue = Number(splited2[0]) + 1;
  */
};

const command = new SlashCommandBuilder()
    .setName(PERSONALITY.getCommands().polls.name)
    .setDescription(PERSONALITY.getCommands().polls.description)
    .setDefaultMemberPermissions(0x0000010000000000)
    .addStringOption((option) => 
      option //title
        .setName(PERSONALITY.getCommands().polls.titleOption.name)
        .setDescription(PERSONALITY.getCommands().polls.titleOption.description)
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(256)
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
    .addBooleanOption((option) =>
      option //vote
        .setName(PERSONALITY.getCommands().polls.voteOption.name)
        .setDescription(PERSONALITY.getCommands().polls.voteOption.description)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option //color
        .setName(PERSONALITY.getCommands().polls.colorOption.name)
        .setDescription(PERSONALITY.getCommands().polls.colorOption.description)
        .setRequired(false)
    );

const bullet = [":one:", ":two:", ":three:", ":four:", ":five:", ":six:", ":seven:", ":eight", ":nine:", ":keycap_ten:"];
const black = ":black_large_square:";
const white = ":white_large_square:";

const action = (interaction) => {
    const options = interaction.options;
    const perso = PERSONALITY.getCommands().polls;

    //get options
    const title = options.getString(perso.titleOption.name);
    const choices = options.getString(perso.choiceOption.name);

    const description = options.getString(perso.descOption.name, false);
    let option = options.getBoolean(perso.hideOption.name, false);
    const anonymous = option == null ? true : option;
    option = options.getBoolean(perso.voteOption.name, false);
    const vote = option == null ? true : option;
    option = options.getString(perso.colorOption.name, false);
    const color = option == null ? "BLUE" : option;

    //create embed
    const embed = new MessageEmbed()
      .setTitle(title)
      .setTimestamp()
      .setColor(color);

    // Optionnal parameters
    if (description) embed.setDescription(description);

    //write choices text
    const splited = choices.split(";");
    const results = splited.reduce((acc, cur, idx) => {
      if (cur.includes(",")) {
        const emote = cur.split(",")[0];
        const replaced = cur.replace(",", "");
        return {fields: [...acc.fields, replaced], emotes: [...acc.emotes, emote]};
      } else {
        const emote = bullet[idx];
        const text = emote + cur.replace(",", "");
        return {fields: [...acc.fields, text], emotes: [...acc.emotes, emote]};
      }
    }, {fields: [], emotes: []});

    console.log("results", results);
    results.fields.forEach(field => {
      embed.addFields({name: field, value: black.repeat(10) + " (0)"})
    });

    //create vote buttons
    const components = results.emotes.reduce((acc, cur, idx) => {
      const buttonId = "polls_" + idx.toString();
      const button = createButton(buttonId, null, "SECONDARY", cur);

      if (idx === 0 || acc.size === 5) {
        const newRow = new MessageActionRow().addComponents(button);
        return {actionRows: [...acc.actionRows, newRow], size: 1};
      } else {
        const lastAR = acc.actionRows[acc.actionRows.length - 1];
        lastAR.addComponents(button);
        return {actionRows: acc.actionRows, size: acc.size + 1};
      }
    }, {actionRows: [], size: 0});
    console.log("components", components);

    //send poll
    interaction.channel.send({embeds: [embed], components: components.actionRows});
    interactionReply(interaction, perso.sent);
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
}

export default polls;