import { ContextMenuCommandBuilder } from "@discordjs/builders";

import { getLogChannel } from "../admin/utils.js";
import { interactionReply } from "./utils.js";
import { PERSONALITY } from "../personality.js";

const command = new ContextMenuCommandBuilder()
  .setName("save-log")
  .setType(3);

const action = async (interaction) => {
  console.log("action")
  const message = interaction.targetMessage; //get message
  const embeds = message.embeds; //get embeds

  const personality = PERSONALITY.getCommands().saveLog;

  if (embeds) {
    //add executor of saveLog
    const member = interaction.member;
    embeds[0].addFields(
      { name: personality.author, value: member.toString(), inline: true }
    );

    //get logChannel
    const logChannel = await getLogChannel(interaction); //get logChannel
    logChannel.send({ embeds: embeds, allowed_mentions: { parse: [] } }); //Send log
  }


  //reply to interaction
  interactionReply(interaction, personality.sending);
};

const saveLog = {
  action,
  command,
  help: (interaction) => {
    const personality = PERSONALITY.getCommands().saveLog;
    interactionReply(interaction, personality.help);
  }
};

export default saveLog;