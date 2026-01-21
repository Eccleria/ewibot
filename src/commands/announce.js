import { SlashCommandBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ButtonStyle, MessageFlags } from "discord.js";
import { interactionReply } from "ewilib";

import { createButton } from "./utils.js";
import { isAdmin } from "../helpers/index.js";
import { PERSONALITY } from "../classes/personality.js";

// ANNOUNCE

//announce action
const action = (interaction) => {
  // handle announce command interaction

  const announceP = PERSONALITY.getPersonality().announce; //get personality

  if (!isAdmin(interaction.user.id)) {
    //check for admin
    interactionReply(interaction, announceP.notAdmin);
    return;
  }

  //get interaction data
  //const client = interaction.client;
  const options = interaction.options;
  const whichAnnounce = options.getString(announceP.stringOption.name);
  const whichAnnounceP = PERSONALITY.getAnnounces()[whichAnnounce];
  //create confirm button
  const actionRow = new ActionRowBuilder().addComponents(
    createButton(whichAnnounceP.id, announceP.buttonLabel, ButtonStyle.Danger),
  );

  interactionReply(interaction, {
    content: whichAnnounceP.confirm,
    components: [actionRow],
    flags: MessageFlags.Ephemeral,
  });
};

//list of announces
const announces = []; //list of all announces

//button action dispatcher
export const announceButtonHandler = (interaction) => {
  const whichButton = interaction.customId;
  const foundAnnounce = announces.find(
    (obj) => obj.button.value === whichButton,
  );

  if (foundAnnounce) foundAnnounce.action(interaction);
  else
    interactionReply(
      interaction,
      PERSONALITY.getPersonality().announce.notFound,
    );
};

//announce command
const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getPersonality().announce.name)
  .setDescription(PERSONALITY.getPersonality().announce.description)
  .setDefaultMemberPermissions(0x0000010000000000)
  .addStringOption((option) =>
    option
      .setName(PERSONALITY.getPersonality().announce.stringOption.name)
      .setDescription(
        PERSONALITY.getPersonality().announce.stringOption.description,
      )
      .addChoices(...announces.map((obj) => obj.button)),
  );

const announce = {
  action,
  command,
  help: (interaction) => {
    interactionReply(interaction, PERSONALITY.getPersonality().announce.help);
  },
  admin: true,
  releaseDate: null,
  sentinelle: true,
};

export default announce;
