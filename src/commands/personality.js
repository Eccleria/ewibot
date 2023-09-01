import { SlashCommandBuilder } from "discord.js";

import { interactionReply } from "./utils.js";

import { PERSONALITY } from "../personality.js";


const command = new SlashCommandBuilder()
    .setName(PERSONALITY.getCommands().personality.name)
    .setDescription(PERSONALITY.getCommands().personality.description)
    .setDefaultMemberPermissions()
    .addStringOption((option) => 
      option
        .setName(PERSONALITY.getCommands().personality.stringOption.name)
        .setDescription(PERSONALITY.getCommands().personality.stringOption.description)
        .setRequired(true)
        .addChoices()
    );

const action = (message) => {
  const args = message.content.toLowerCase().split(" ");
  const nameList = Object.keys(personalities); // List of all personalities names
  const replies = PERSONALITY.getCommands().personality;

  if (args.length === 1) {
    // If no content, send actual personality name
    message.reply(replies.currentName + PERSONALITY.getName() + ".");
  } else if (args[1]) {
    if (nameList.includes(args[1])) {
      // If args[1] is in personalities.json
      const foundPersonality = Object.values(personalities).find(
        (obj) => obj.name === args[1]
      );
      if (foundPersonality) {
        PERSONALITY.set(foundPersonality.name, foundPersonality);
        message.reply(replies.change + `${args[1]}.`);
      }
    } else if (args[1] === "list") {
      // Send  personality name list
      message.reply(replies.nameList + `${nameList.join(", ")}.`);
    } else message.reply(replies.nameError);
  }
};

const personality = {
  command,
  action,
  help: (interaction) => {
    const perso = PERSONALITY.getCommands().personality;
    interactionReply(interaction, perso.help);
  },
  admin: true,
};

export default personality;