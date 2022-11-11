import { SlashCommandBuilder } from "@discordjs/builders";
import { isAdmin } from "../helpers";

import { PERSONALITY } from "../personality";
import { interactionReply } from "./utils";

const giftAnnounce = {
  name: "gift",
  value: "announce_gift"
};

const action = (interaction) => {
  // handle announce command interaction

  if (!isAdmin(interaction.author.id)) {
    //check for bot admin
    interactionReply(interaction, PERSONALITY.getCommands().announce.notAdmin);
    return
  }

  const personality = PERSONALITY.getCommands().announce;

  //get interaction data
  //const client = interaction.client;
  const options = interaction.options;
  const whichAnnounce = options.getString(personality.stringOption.name);

  interaction.reply(personality[whichAnnounce].confirm)
};

const announceOptions = [giftAnnounce];

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getCommands().announce.name)
  .setDescription(PERSONALITY.getCommands().announce.description)
  .setDefaultMemberPermissions(0x0000010000000000)
  .addStringOption(
    (option) =>
      option
        .setName(PERSONALITY.getCommands().announce.stringOption.name)
        .setDescription(PERSONALITY.getCommands().announce.stringOption.description)
        .addChoices(...announceOptions)
  );

const announce = {
  action,
  command,
  help: (interaction) => {
    interactionReply(interaction, PERSONALITY.getCommands().announce.help)
  }
};

export default announce;