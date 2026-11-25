import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ButtonStyle, MessageFlags } from "discord.js";
import { interactionReply } from "ewilib";

import { isAdmin } from "../helpers/index.js";
import { COMMONS } from "../classes/commons.js";
import { PERSONALITY } from "../classes/personality.js";

// APOLOGY

const command = new ContextMenuCommandBuilder()
  .setName(PERSONALITY.getPersonality().apology.name)
  .setType(3);

//apology action
const action = (interaction) => {
  // handle apology command interaction
  const apologyP = PERSONALITY.getPersonality().apology; //get personality

  if (!isAdmin(interaction.user.id)) {
    //check for admin
    interactionReply(interaction, apologyP.notAdmin);
    return;
  }

  //get interaction data
  const message = interaction.targetMessage;
  const currentServer = COMMONS.fetchFromGuildId(channel.guildId);

  //count the apology directly
  addApologyCount(interaction.client.db, targetMessage.author.id);

  //react to the message
  
  await targetMessage.fetch()
  if (targ
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
