import { ContextMenuCommandBuilder } from "@discordjs/builders";

import { getLogChannel, gifRecovery } from "../admin/utils.js";
import { interactionReply } from "./utils.js";
import { PERSONALITY } from "../personality.js";

const command = new ContextMenuCommandBuilder()
  .setName("save-log")
  .setType(3)
  .setDefaultMemberPermissions(0x0000010000000000); //MODERATE_MEMBERS bitwise

const action = async (interaction, commons) => {
  const message = interaction.targetMessage; //get message
  const embeds = message.embeds; //get embeds

  const personality = PERSONALITY.getCommands(); //get personality
  const admin = PERSONALITY.getAdmin();
  const messageDe = admin.messageDelete;
  const saveLogP = personality.saveLog;

  //check for thread channel
  const isLogThread = commons.some(
    ({ logThreadId }) => logThreadId === message.channelId
  ); //get server local data
  if (!isLogThread) {
    interactionReply(interaction, saveLogP.wrongChannel);
    return;
  }

  //check for containing embeds
  if (embeds.length === 0) {
    interactionReply(interaction, saveLogP.noEmbed);
    return;
  }

  //check for messageUpdate/Delete log
  const titleTest = [messageDe.title, admin.messageUpdate.title];
  const isCorrectEmbed = titleTest.includes(embeds[0].title);
  if (!isCorrectEmbed) {
    interactionReply(interaction, saveLogP.wrongMessage);
    return;
  }

  const logChannel = await getLogChannel(commons, interaction); //get logChannel

  //add executor of saveLog
  const member = interaction.member;
  embeds[0].addFields({
    name: saveLogP.author,
    value: member.toString(),
    inline: true,
  });

  await logChannel.send({ embeds: embeds, allowed_mentions: { parse: [] } }); //Send log
  interactionReply(interaction, saveLogP.sent); //reply to interaction

  //handle gifs
  const contentTest = [messageDe.text, messageDe.textAgain]; //get text field names
  const fields = embeds[0].fields; //get embed fields
  const foundFields = fields.filter((obj) => contentTest.includes(obj.name)); //get corresponding fields

  let gifs = [];
  if (foundFields.length !== 0) {
    //if any foundFields, find gifs
    gifs = foundFields.reduce((acc, field) => {
      const gif = gifRecovery(field.value);
      if (gif !== null) return [...acc, ...gif];
      return acc;
    }, []);
  }

  if (gifs.length !== 0) gifs.forEach((gif) => logChannel.send(gif));
};

const saveLog = {
  action,
  command,
  help: (interaction) => {
    const personality = PERSONALITY.getCommands().saveLog;
    interactionReply(interaction, personality.help);
  },
  releaseDate: null,
  sentinelle: true,
};

export default saveLog;
