import { ContextMenuCommandBuilder } from "@discordjs/builders";

import { getLogChannel, gifRecovery } from "../admin/utils.js";
import { interactionReply } from "./utils.js";
import { PERSONALITY } from "../personality.js";

const command = new ContextMenuCommandBuilder()
  .setName("save-log")
  .setType(3)
  .setDefaultMemberPermissions(0x0000000000000020); //MANAGE_GUILD bitwise

const action = async (interaction, commons) => {
  const message = interaction.targetMessage; //get message
  const embeds = message.embeds; //get embeds

  const personality = PERSONALITY.getCommands(); //get personality
  const messageDe = PERSONALITY.getAdmin().messageDelete;
  const saveLogP = personality.saveLog;
  const logChannel = await getLogChannel(commons, interaction); //get logChannel

  interactionReply(interaction, saveLogP.sending);  //reply to interaction

  if (embeds) {
    //add executor of saveLog
    const member = interaction.member;
    embeds[0].addFields(
      { name: saveLogP.author, value: member.toString(), inline: true }
    );

    logChannel.send({ embeds: embeds, allowed_mentions: { parse: [] } }); //Send log

    const test = [messageDe.text, messageDe.textAgain]; //get messageDelete text field name
    const fields = embeds[0].fields; //get embed fields
    const foundFields = fields.filter((obj) => test.includes(obj.name)); //get corresponding fields

    let gifs = null;
    if (foundFields.length !== 0) {
      //if any foundFields, find gifs
      gifs = foundFields.reduce((acc, field) => {
        const gif = gifRecovery(field.value);
        if (gif !== null) return [...acc, ...gif];
        return acc;
      }, [])
    }

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
  }
};

export default saveLog;