import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
//import { removeEmote } from "../admin/utils";
import { PERSONALITY } from "../personality.js";
import {interactionReply} from "./utils.js";


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
        return {fields: [...acc.fields, cur], emotes: [...acc.emotes, emote]};
      } else {
        const emote = bullet[idx];
        const text = emote + cur;
        return {fields: [...acc.fields, text], emotes: [...acc.emotes, emote]};
      }
    }, {fields: [], emotes: []});

    console.log("results", results);
    results.fields.forEach(field => {
      embed.addFields({name: field, value: "1 (0)"})
    });

    //send poll
    interaction.channel.send({embeds: [embed]});
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