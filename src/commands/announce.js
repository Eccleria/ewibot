import { SlashCommandBuilder } from "@discordjs/builders";

import { PERSONALITY } from "../personality";
import { interactionReply } from "./utils";

const giftAnnounce = {
  name: "gift",
  value: "announce_gift"
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