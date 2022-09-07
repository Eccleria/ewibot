import { ContextMenuCommandBuilder } from "@discordjs/builders";

import { getLogChannel } from "../admin/utils.js";
import { interactionReply } from "./utils.js";
import { getAdminLogs } from "../helpers/index.js";
import { PERSONALITY } from "../personality.js";

const command = new ContextMenuCommandBuilder()
  .setName("save-log")
  .setType(3);

const action = async (interaction) => {
  console.log("action");

  interactionReply(interaction, personality.sending);  //reply to interaction

  const message = interaction.targetMessage; //get message
  const embeds = message.embeds; //get embeds

  const personality = PERSONALITY.getCommands().saveLog; //get personality
  const logChannel = await getLogChannel(interaction); //get logChannel

  if (embeds) {
    //add executor of saveLog
    const member = interaction.member;
    embeds[0].addFields(
      { name: personality.author, value: member.toString(), inline: true }
    );

    logChannel.send({ embeds: embeds, allowed_mentions: { parse: [] } }); //Send log

    const dbData = getAdminLogs(interaction.client.db);
    const logIds = dbData.reduce((acc, cur) => {
      return [...acc, ...cur];
    }, []); //regroup all ids

    const max = logIds.length - 1;
    const idx = logIds.findIndex((id) => id === message.id);
    //-1 or length => return
    if (idx > -1 && idx < max) {
      const id = logIds[idx + 1];
      const threadChannel = await getLogChannel(interaction, "thread");
      const gif = await threadChannel.messages.fetch(id);
      logChannel.send({ content: gif.content })
    }
  }
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