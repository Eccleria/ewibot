import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageEmbed } from "discord.js";
import {
  addPoll,
  addPollVoter,
  getPoll,
  isGlobalPollVoter,
  isThisChoicePollVoter,
} from "../helpers/index.js";
import { PERSONALITY } from "../personality.js";
import { pollButtonCollector } from "./pollsCollectors.js";
import { createButton, interactionReply } from "./utils.js";

const black = ":black_large_square:"; //black emote for empty progress bar

export const pollsButtonHandler = (interaction) => {
  // Dispatch button action to corresponding functions
	const {customId} = interaction;
  if (typeof Number(customId[6]) == "number")
    voteButtonHandler(interaction);
	else if (customId.includes("settings")) 
		settingsButtonHandler(interaction);
};

const settingsButtonHandler = (interaction) => {
	const perso = PERSONALITY.getCommands().polls;
  interactionReply(interaction, perso.settings);
};

const voteButtonHandler = async (interaction) => {
  // count vote, update db + embed
  const { customId, message, user } = interaction;

  //get data
  const voteIdx = Number(customId.slice(6)); //field id to add 1
  const pollEmbed = message.embeds[0];
  const fields = pollEmbed.fields; //get embed fields
  const perso = PERSONALITY.getCommands().polls; //get personality

  //get db data
  const db = interaction.client.db;
  const pollId = message.id;
  const dbPoll = getPoll(db, pollId);
  const userId = user.id;

  //check for voteType
  const voteType = dbPoll.voteType;
  if (voteType === perso.voteOption.choices[0].value) {
    //unique
    const hasVoted = isGlobalPollVoter(db, pollId, userId);
    if (hasVoted) {
      interaction.editReply(perso.hasVoted);
      return;
    }
  } else if (voteType === perso.voteOption.choices[1].value) {
    //multiple
    const hasVoted = isThisChoicePollVoter(db, pollId, userId, voteIdx);
    if (hasVoted) {
      interaction.editReply(perso.hasVotedChoice);
      return;
    }
  }

  //update db
  addPollVoter(db, pollId, userId, voteIdx);

  //get number values for each field
  const fieldNumbers = fields.reduce(
    (acc, cur, idx) => {
      //"emotes ...*% (no)"
      const splited = cur.value.split(" ");
      const ratio = Number(splited[1].slice(0, -1)); //ratio

      //new value check
      const oldValue = splited[2].includes("\n") ? Number(splited[2].split("\n")[0].slice(1, -1)) : Number(splited[2].slice(1, -1));
      const value = idx === voteIdx ? oldValue + 1 : oldValue;

      return { values: [...acc.values, value], ratios: [...acc.ratios, ratio] };
    },
    { values: [], ratios: [] }
  );
  console.log("fieldNumbers", fieldNumbers);

  //compute new ratios
  const values = fieldNumbers.values;
  const total = values.reduce((acc, cur) => acc + cur, 0); //get total count nb
  const newRatios = values.map((value) => Math.round((value / total) * 100)); //emote ratio

  //get progress bar color
  const colorIdx = dbPoll.colorIdx; //db data
  const emoteColor = perso.colorOption.colors.progress_bar[colorIdx]; //emoteId from personality

  //get isAnonymous
  const isAnonymous = dbPoll.anonymous;

  //write new fields
  const newFields = newRatios.reduce((acc, cur, idx) => {
    const oldField = fields[idx];
    if (voteIdx !== idx && cur === fieldNumbers.ratios[idx]) {
      //nothing to change => reuse oldField
      return [...acc, oldField];
    } else {
      //update values
      const nb = Math.floor(cur / 10);
      const newValues =
        emoteColor.repeat(nb) +
        black.repeat(10 - nb) +
        ` ${cur}% (${values[idx]})`;

      //update voters + send
      if (isAnonymous) 
        return [...acc, { value: newValues, name: oldField.name }];
      else {
        const oldValue = oldField.value; //get oldField
        const oldText = oldValue.includes("\n") ? oldValue.split("\n")[1] : "";
        const text = newValues + "\n" + oldText;
        const newVoter = user.toString(); //get voter as embed
        const newField = voteIdx !== idx ? text : text + `${newVoter} `; //if right idx, add voter
        return [...acc, { value: newField, name: oldField.name }];
      }
    }
  }, []);
  console.log("newFields", newFields);

  //update embed
  pollEmbed.setFields(...newFields);
  await message.edit({ embeds: [pollEmbed], components: message.components });
  interaction.editReply({content: perso.counted, ephemeral: true});
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
  );

const bullet = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

const action = async (interaction) => {
  const options = interaction.options;
  const perso = PERSONALITY.getCommands().polls;

  //get options
  const title = options.getString(perso.titleOption.name);
  const choices = options.getString(perso.choiceOption.name);

  const description = options.getString(perso.descOption.name, false);
  let option = options.getBoolean(perso.hideOption.name, false);
  const anonymous = option == null ? true : option; //if true, no name displayed
  option = options.getString(perso.voteOption.name, false);
  const voteType = option == null ? perso.voteOption.choices[0].value : option; //if true, only one vote
  option = options.getString(perso.colorOption.name, false);
  const color =
    option == null ? perso.colorOption.colors.choices[4].value : option;

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

  console.log("results", results);
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
  console.log("components", components);
  
	//add setting button
	const settingId = "polls_" + "settings";
	const settingButton = createButton(settingId, null, "SECONDARY", "⚙️");
	if (components.size === 5) {
		const newRow = new MessageActionRow().addComponents(settingButton);
		components.actionRows.push(newRow);
	} else components.actionRows[components.actionRows.length - 1].addComponents(settingButton);

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
  console.log("dbVotes", dbVotes);
  addPoll(
    interaction.client.db,
    pollMsg.id,
    dbVotes,
    anonymous,
    voteType,
    colorIdx
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
