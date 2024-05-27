import { ActionRowBuilder, ButtonStyle, Colors, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { COMMONS } from "./commons.js";
import { createButton } from "./commands/utils.js";
import { PERSONALITY } from "./personality.js";
import { interactionEditReply } from "./commands/polls/pollsUtils.js";
import { fetchSelectMenuReferenceMessage } from "./helpers/utils.js";

export const firstReactToAccountabilityMessage = (message) => {
  const commons = COMMONS.getShared();

  if (message.content.includes(":"))
    message.react(commons.accountabilityBuddy.toDoEmoteId);
};

export const accountabilityReactHandler = (messageReaction, user) => {
  messageReaction.remove(); //remove all users from this reaction

  const commons = COMMONS.getShared();
  const perso = PERSONALITY.getPersonality().accountabilityBuddy;
  const aCmn = commons.accountabilityBuddy;
  const { message } = messageReaction;
  const { content } = message;

  //process message content
  const lines = content.split("\n");
  console.log("lines", lines);
  const processed = lines.reduce((acc, cur) => {
    const trimmed = " " + cur.trim();
    
    if (cur.includes(":")) return [...acc, aCmn.starEmoteId + trimmed];
    else if (cur.length) return [...acc, aCmn.toDoEmoteId + trimmed];
    else return [...acc, cur];
  }, []);
  console.log("processed", processed);
  const newContent = processed.join("\n");

  //create embed
  const embed = new EmbedBuilder()
    .setAuthor({ name: user.username, iconURL: user.avatarURL() })
    .setColor(Colors.White)
    .setDescription(newContent)
    .setTimestamp();

  //create buttons
  const style = ButtonStyle.Secondary;
  const currentButton = createButton(perso.currentButton, null, style, aCmn.currentEmoteId);
  const pauseButton = createButton(perso.pauseButton, null, style, aCmn.pauseEmoteId);
  const doneButton = createButton(perso.doneButton, null, style, aCmn.doneEmoteId);
  const cancelButton = createButton(perso.cancelButton, null, style, aCmn.cancelEmoteId);
  const component = new ActionRowBuilder().addComponents(currentButton, pauseButton, doneButton, cancelButton);

  //send content
  message.reply({embeds: [embed], components: [component]});
};

export const accountabilityButtonHandler = async (interaction) => {
  await interaction.deferReply();
  const commons = COMMONS.getShared().accountabilityBuddy;

  //create selectMenu
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("aBuddy_selectMenu")
    .setMinValues(1);

  //set choices
  const message = await interaction.message.fetch();
  console.log("accountabilityButtonHandler", interaction)

  const buttonName = interaction.customId.split("_")[1];
  const choices = message.embeds[0].description.split("\n").reduce((acc, cur, idx) => {
    console.log("cur", cur);
    const choice = {value: "aBuddy_selectMenu_" + `${buttonName}_${idx}`};
    if (!cur.length) return acc; //ignore empty line

    const splited = cur.split(" ");
    if (splited[0] === commons.starEmoteId) return acc; //ignore titles

    splited.shift(); //ignore value, it's an emote
    choice.label = splited.join(" ");
    return [...acc, choice];
  }, [])
  console.log("choices", choices);
  selectMenu.addOptions(...choices);

  //send message
  const actionRow = new ActionRowBuilder().addComponents(selectMenu);
  const payload = { components: [actionRow], ephemeral: true };
  interactionEditReply(interaction, payload);
};

export const accountabilitySelectMenuHandler = async (interaction) => {
  await interaction.deferReply();
  const selected = interaction.values;
  console.log("selected", selected);
  //console.log("selectMenuInteraction", interaction);

  //fetch usefull data
  const commons = COMMONS.getShared().accountabilityBuddy;
  const message = await fetchSelectMenuReferenceMessage(interaction);
  const buddyEmbed = message.embeds[0];
  const embed = EmbedBuilder.from(buddyEmbed);

  //modify the lines required
  const splited = selected[0].split("_");
  const idxToModify = Number(splited[splited.length - 1]); //last element
  console.log("oldEmbed", buddyEmbed, "builder", embed);
  const lines = embed.data.description.split("\n");
  const words = lines[idxToModify].split(" ");
  console.log("idx", idxToModify, "lines", lines, "words", words);
  words[0] = commons[splited[2] + "EmoteId"];
  lines[idxToModify] = words.join(" ");
  embed.setDescription(lines.join("\n"));
  
  //update the message
  message.edit({embeds: [embed]});
  interactionEditReply(interaction, "completed");
};
