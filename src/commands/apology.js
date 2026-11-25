import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { ApplicationCommandType } from "discord.js";
import { interactionReply } from "ewilib";

import { addApologyCount, isAdmin } from "../helpers/index.js";
import { COMMONS } from "../classes/commons.js";
import { PERSONALITY } from "../classes/personality.js";

// APOLOGY

const command = new ContextMenuCommandBuilder()
  .setName(PERSONALITY.getPersonality().apology.name)
  .setType(ApplicationCommandType.Message);

//apology action
const action = async (interaction) => {
  // handle apology command interaction
  const perso = PERSONALITY.getPersonality().apology; //get personality

  if (!isAdmin(interaction.user.id)) {
    //check for admin
    interactionReply(interaction, perso.notAdmin);
    return;
  }

  //get interaction data
  const message = interaction.targetMessage;
  const currentServer = COMMONS.fetchFromGuildId(message.guildId);

  //count the apology directly
  addApologyCount(interaction.client.db, message.author.id);

  //react to the message
  await message.fetch();
  if (message) {
    const result = await message.react(currentServer.panDuomReactId); //add message reaction
    if (result) interactionReply(interaction, perso.OK);
    else interactionReply(interaction, perso.KO);
  }
};

const apology = {
  action,
  command,
  help: (interaction) => {
    interactionReply(interaction, PERSONALITY.getPersonality().apology.help);
  },
  admin: true,
  releaseDate: null,
  sentinelle: true,
};

export default apology;
