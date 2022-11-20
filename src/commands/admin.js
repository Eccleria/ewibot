import { ContextMenuCommandBuilder } from "@discordjs/builders";

import { getLogChannel, gifRecovery } from "../admin/utils.js";
import { interactionReply } from "./utils.js";
import { PERSONALITY } from "../personality.js";

const command = new ContextMenuCommandBuilder()
  .setName("save-log")
  .setType(3)
  .setDefaultMemberPermissions(0x0000000000000020); //MANAGE_GUILD bitwise

const action = async (interaction) => {
  const message = interaction.targetMessage; //get message
  const embeds = message.embeds; //get embeds

  const personality = PERSONALITY.getCommands(); //get personality
  const admin = PERSONALITY.getAdmin();
  const saveLogP = personality.saveLog;
  const logChannel = await getLogChannel(interaction); //get logChannel

  interactionReply(interaction, saveLogP.sending);  //reply to interaction

  if (embeds) {
    //add executor of saveLog
    const member = interaction.member;
    embeds[0].addFields(
      { name: saveLogP.author, value: member.toString(), inline: true }
    );

    logChannel.send({ embeds: embeds, allowed_mentions: { parse: [] } }); //Send log

    const test = admin.messageDelete.text; //get messageDelete text field name
    const fields = embeds[0].fields; //get embed fields
    const field = fields.filter((obj) => obj.name === test); //get corresponding field

    const gifs = field.length !== 0 ? gifRecovery(field.value) : null; //if any field, find gifs
    if (gifs !== null) {
      const content = gifs.join("\n");
      logChannel.send(content);
    }
  } else logChannel.send(message.content);
};

const saveLog = {
  action,
  command,
  help: (interaction) => {
    const personality = PERSONALITY.getCommands().saveLog;
    interactionReply(interaction, personality.help);
  },
  admin: true,
  sentinelle: true
};

export default saveLog;