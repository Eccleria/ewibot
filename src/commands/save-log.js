import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { EmbedBuilder } from "discord.js";
import {
  fetchLogChannel,
  gifParser,
  interactionReply,
} from "../helpers/index.js";
import { COMMONS } from "../commons.js";
import { PERSONALITY } from "../personality.js";

const command = new ContextMenuCommandBuilder()
  .setName("save-log")
  .setType(3)
  .setDefaultMemberPermissions(0x0000010000000000); //MODERATE_MEMBERS bitwise

const action = async (interaction) => {
  const message = interaction.targetMessage; //get message
  const mEmbeds = message.embeds; //get embeds

  const personality = PERSONALITY.getCommands(); //get personality
  const admin = PERSONALITY.getAdmin();
  const messageDe = admin.messageDelete;
  const saveLogP = personality.saveLog;

  //check for thread channel
  const logIds = COMMONS.getList().map((obj) => obj.logThreadId);
  const isLogThread = logIds.includes(message.channelId);
  if (!isLogThread) {
    interactionReply(interaction, saveLogP.wrongChannel);
    return;
  }
  //check if is only attachment message
  if (message.attachments.size !== 0) {
    const logChannel = await fetchLogChannel(interaction); //get logChannel
    const attachments = message.attachments.reduce(
      (acc, cur) => [...acc, cur],
      []
    );
    logChannel.send({ files: attachments });

    interactionReply(interaction, saveLogP.sent); //reply to interaction
    return;
  }

  //check for containing embeds
  if (mEmbeds.length === 0) {
    interactionReply(interaction, saveLogP.noEmbed);
    return;
  }

  //check for messageUpdate/Delete log
  const titleTest = [messageDe.title, admin.messageUpdate.title];
  const isCorrectEmbed = titleTest.includes(mEmbeds[0].title);
  if (!isCorrectEmbed) {
    interactionReply(interaction, saveLogP.wrongMessage);
    return;
  }

  const logChannel = await fetchLogChannel(interaction); //get logChannel

  //add executor of saveLog
  const member = interaction.member;
  const embeds = mEmbeds.map((cur) => EmbedBuilder.from(cur));
  embeds[0].addFields({
    name: saveLogP.author,
    value: member.toString(),
    inline: true,
  });

  await logChannel.send({ embeds: embeds, allowed_mentions: { parse: [] } }); //Send log
  interactionReply(interaction, saveLogP.sent); //reply to interaction

  //handle gifs
  const contentTest = [messageDe.text, messageDe.textAgain]; //get text field names
  const fields = embeds[0].data.fields; //get embed fields
  const foundFields = fields.filter((obj) => contentTest.includes(obj.name)); //get corresponding fields

  let gifs = [];
  if (foundFields.length !== 0) {
    //if any foundFields, find gifs
    gifs = foundFields.reduce((acc, field) => {
      const gif = gifParser(field.value);
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
  admin: true,
  releaseDate: null,
  sentinelle: true,
};

export default saveLog;
