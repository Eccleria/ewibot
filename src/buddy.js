import { ActionRowBuilder, ButtonStyle, Colors, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { COMMONS } from "./commons.js";
import { createButton } from "./commands/utils.js";
import { PERSONALITY } from "./personality.js";
import { interactionEditReply } from "./commands/polls/pollsUtils.js";

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

  //create selectMenu
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("aBuddy_selectMenu")
    .setMaxValues(1);

  //set choices
  const message = await interaction.message.fetch();
  console.log("content", message)

  const choices = message.content.split("\n").reduce((acc, cur, idx) => {
    const choice = {value: "aBuddy_selectMenu_" + idx};
    if (!cur.length) return acc; //ignore empty line

    const splited = cur.split(" ");
    splited.shift(); //ignore value, it's an emote
    choice.label = splited;
    return [...acc, choice];
  }, [])
  console.log("choices", choices);
  selectMenu.addOptions(...choices);

  //send message
  const actionRow = new ActionRowBuilder().addComponents(selectMenu);
  const payload = { components: [actionRow], ephemeral: true };
  interactionEditReply(interaction, payload);
};
