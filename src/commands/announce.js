import { SlashCommandBuilder } from "@discordjs/builders";

import { PERSONALITY } from "../personality"
import { interactionReply } from "./utils"


const announce = {
  action,
  command,
  help: (interaction) => {
    interactionReply(interaction, PERSONALITY.getCommands().announce.help)
  }
};

export default announce;