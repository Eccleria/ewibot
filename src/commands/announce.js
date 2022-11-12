import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow } from "discord.js";

import { createButton, interactionReply } from "./utils.js";
import { isAdmin } from "../helpers/index.js";
import { PERSONALITY } from "../personality.js";

// GIFT Announce
const giftAction = (interaction) => {
  const personality = PERSONALITY.getCommands().announce.gift;
  interactionReply(interaction, personality.sending);
};

const giftAnnounce = {
  action: giftAction,
  button: {
    name: "gift",
    value: "announce_gift",
  }
};

// ANNOUNCE

//announce action
const action = (interaction) => {
  // handle announce command interaction

  if (!isAdmin(interaction.user.id)) {
    //check for bot admin
    interactionReply(interaction, PERSONALITY.getCommands().announce.notAdmin);
    return;
  }

  //get personality
  const personality = PERSONALITY.getCommands().announce;

  //get interaction data
  //const client = interaction.client;
  const options = interaction.options;
  const whichAnnounce = options.getString(personality.stringOption.name);

  //create confirm button
  const actionRow = new MessageActionRow().addComponents(
    createButton(personality.button.id, personality.button.label, "DANGER")
  );

  interaction.reply({
    content: personality[whichAnnounce].confirm,
    components: [actionRow],
    ephemeral: true,
  });
};

//usefull lists of announces
const announces = [giftAnnounce]; //list of all announces
const announceChoices = [announces.map((obj) => obj.button)]; //list of choices for announce command

//announce command
const command = new SlashCommandBuilder() 
  .setName(PERSONALITY.getCommands().announce.name)
  .setDescription(PERSONALITY.getCommands().announce.description)
  .setDefaultMemberPermissions(0x0000010000000000)
  .addStringOption((option) =>
    option
      .setName(PERSONALITY.getCommands().announce.stringOption.name)
      .setDescription(
        PERSONALITY.getCommands().announce.stringOption.description
      )
      .addChoices(...announceChoices)
  );

const announce = {
  action,
  command,
  help: (interaction) => {
    interactionReply(interaction, PERSONALITY.getCommands().announce.help);
  },
};

export default announce;
