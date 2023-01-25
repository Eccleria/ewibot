import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageEmbed } from "discord.js";
import { addPoll } from "../../helpers/index.js";
import { PERSONALITY } from "../../personality.js";
import { pollButtonCollector } from "./pollsCollectors.js";
import { createButton, interactionReply } from "../utils.js";
import { voteButtonHandler } from "./pollHandler.js";

const black = ":black_large_square:"; //black emote for empty progress bar

export const pollsButtonHandler = (interaction) => {
  // Dispatch button action to corresponding functions
  const { customId } = interaction;

  const sixNumber = Number(customId[6]);
  const voteButtonTest = !isNaN(sixNumber) && typeof sixNumber == "number";
  if (voteButtonTest) voteButtonHandler(interaction);
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
    option
      .setName(PERSONALITY.getCommands().polls.maxOption.name)
      .setDescription(PERSONALITY.getCommands().polls.maxOption.description)
      .setRequired(false)
      .setMinValue(1)
  );

const bullet = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

const action = async (interaction) => {
  const options = interaction.options;
  const perso = PERSONALITY.getCommands().polls;

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

  //create embed
  const embed = new MessageEmbed()
    .setTitle(title)
    .setTimestamp()
    .setColor(color);

  // Optionnal parameters
  if (description) embed.setDescription(description);

  //write choices text
  const splited = choices.split(";");
  const results = splited.reduce(
    (acc, cur, idx) => {
      const replaced = cur.replace(",", "");
      if (cur.includes(",")) {
        //if choices includes emote
        const emote = cur.split(",")[0];
        return {
          fields: [...acc.fields, replaced],
          emotes: [...acc.emotes, emote],
        };
      } else {
        const emote = bullet[idx];
        const text = idx === 0 ? emote + " " + replaced : emote + replaced;
        return {
          fields: [...acc.fields, text],
          emotes: [...acc.emotes, emote],
        };
      }
    },
    { fields: [], emotes: [] }
  );

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
  const settingButton = createButton(
    settingId,
    null,
    "SECONDARY",
    "⚙️"
  );

  if (components.size === 5) {
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

  pollButtonCollector(pollMsg);
  interactionReply(interaction, perso.sent);

  //save poll
  const dbVotes = results.fields.reduce((acc) => {
    acc.push([]);
    return acc;
  }, []);
  const colorIdx = perso.colorOption.colors.choices.findIndex(
    (obj) => obj.value === color
  );

  addPoll(
    interaction.client.db,
    pollMsg.id,
    dbVotes,
    anonymous,
    voteType,
    colorIdx,
    voteMax
  );
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
