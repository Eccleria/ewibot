import { SlashCommandBuilder } from "discord.js";
import { readFileSync } from "fs";

import { slashCommandsInit } from "./slash.js";
import { interactionReply } from "../helpers/index.js";
import { PERSONALITY } from "../personality.js";

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getCommands().personality.name)
  .setDescription(PERSONALITY.getCommands().personality.description)
  .setDefaultMemberPermissions(0x0000010000000000)
  .addStringOption((option) =>
    option
      .setName(PERSONALITY.getCommands().personality.stringOption.name)
      .setDescription(
        PERSONALITY.getCommands().personality.stringOption.description,
      )
      .setRequired(false)
      .addChoices(
        ...PERSONALITY.getPersonalities().map((pName) => {
          return { name: pName, value: "personality_" + pName };
        }),
      ),
  );

const action = (interaction) => {
  const perso = PERSONALITY.getCommands().personality;
  const nameList = PERSONALITY.getPersonalities(); // List of all personalities names
  const option = interaction.options.getString(perso.stringOption.name);

  if (option) {
    //want to change personality
    const foundP = nameList.find((name) => option.includes(name));

    if (foundP) {
      //open file
      const path = "static/personalities/";
      const newP = JSON.parse(readFileSync(path + foundP + ".json"));
      PERSONALITY.setPersonality(newP.name, newP[foundP]);

      slashCommandsInit(interaction.guildId, interaction.client); //commands submit to API

      interactionReply(interaction, perso.changed + newP.name);
    } else interactionReply(interaction, perso.nameError);
  } else {
    //ant to get current personality name
    const content = perso.currentName + PERSONALITY.getName() + ".";
    interactionReply(interaction, content);
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
