import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord-api-types/v9";
import { isAdmin } from "../helpers/utils.js";
//import { ChannelType } from "discord.js"; //for discordjs v14

import { PERSONALITY } from "../personality.js";
import { interactionReply } from "./utils.js";

const command = new SlashCommandBuilder()
  .setDefaultMemberPermissions(0)
  .setName(PERSONALITY.getCommands().botMessage.name)
  .setDescription(PERSONALITY.getCommands().botMessage.description)
  .addSubcommand((command) =>
    command //send
      .setName(PERSONALITY.getCommands().botMessage.send.name)
      .setDescription(PERSONALITY.getCommands().botMessage.send.description)
      .addChannelOption((option) =>
        option
          .setName(PERSONALITY.getCommands().botMessage.send.channelOption.name)
          .setDescription(
            PERSONALITY.getCommands().botMessage.send.channelOption.description
          )
          .setRequired(false)
          .addChannelTypes(ChannelType.GuildText)
      )
      .addStringOption((option) =>
        option
          .setName(PERSONALITY.getCommands().botMessage.send.stringOption.name)
          .setDescription(
            PERSONALITY.getCommands().botMessage.send.stringOption.description
          )
          .setMinLength(1)
          .setRequired(false)
      )
      .addAttachmentOption((option) =>
        option
          .setName(
            PERSONALITY.getCommands().botMessage.send.attachmentOption.name
          )
          .setDescription(
            PERSONALITY.getCommands().botMessage.send.attachmentOption
              .description
          )
          .setRequired(false)
      )
      .addBooleanOption((option) =>
        option
          .setName(PERSONALITY.getCommands().botMessage.send.booleanOption.name)
          .setDescription(
            PERSONALITY.getCommands().botMessage.send.booleanOption.description
          )
          .setRequired(false)
      )
  )
  .addSubcommand((command) =>
    command //reply
      .setName(PERSONALITY.getCommands().botMessage.reply.name)
      .setDescription(PERSONALITY.getCommands().botMessage.reply.description)
      .addStringOption((option) =>
        option //url
          .setName(PERSONALITY.getCommands().botMessage.reply.urlOption.name)
          .setDescription(
            PERSONALITY.getCommands().botMessage.reply.urlOption.description
          )
          .setMinLength(1)
          .setRequired(true)
      )
      .addStringOption((option) =>
        option //text
          .setName(PERSONALITY.getCommands().botMessage.reply.stringOption.name)
          .setDescription(
            PERSONALITY.getCommands().botMessage.reply.stringOption.description
          )
          .setMinLength(1)
          .setRequired(false)
      )
      .addAttachmentOption((option) =>
        option //attachment
          .setName(
            PERSONALITY.getCommands().botMessage.reply.attachmentOption.name
          )
          .setDescription(
            PERSONALITY.getCommands().botMessage.reply.attachmentOption
              .description
          )
          .setRequired(false)
      )
      .addBooleanOption((option) =>
        option //toSpoil
          .setName(PERSONALITY.getCommands().botMessage.reply.spoilOption.name)
          .setDescription(
            PERSONALITY.getCommands().botMessage.reply.spoilOption.description
          )
          .setRequired(false)
      )
      .addBooleanOption((option) =>
        option //toPing
          .setName(PERSONALITY.getCommands().botMessage.reply.pingOption.name)
          .setDescription(
            PERSONALITY.getCommands().botMessage.reply.pingOption.description
          )
          .setRequired(false)
      )
  );

const action = async (interaction) => {
  //console.log(interaction);
  const options = interaction.options;
  const subcommand = options.getSubcommand();
  const personality = PERSONALITY.getCommands().botMessage;

  //check for admin rights
  if (!isAdmin(interaction.user.id)) {
    console.log(`${interaction.user.id} tried to use /message`);
    interactionReply(interaction, personality.wrongUser);
    return;
  }

  if (subcommand === personality.send.name) {
    const sPerso = personality.send; //get personaity

    //get interaction options
    const content = options.getString(sPerso.stringOption.name, false);
    const attachment = options.getAttachment(
      sPerso.attachmentOption.name,
      false
    );
    const fetchedChannel = options.getChannel(sPerso.channelOption.name, false);
    const toSpoil = options.getBoolean(sPerso.booleanOption.name, false);

    const channel = fetchedChannel ? fetchedChannel : interaction.channel;

    //create message payload according to interaction options
    const payload = {};
    if (content) payload.content = content;
    if (toSpoil && attachment) {
      attachment.setSpoiler(toSpoil);
      payload.files = [attachment];
    } else if (attachment) payload.files = [attachment];

    //send message
    if (Object.values(payload).length !== 0) {
      channel.send(payload);
      interactionReply(interaction, sPerso.sent);
    } else interactionReply(interaction, personality.empty);
  } else if (subcommand === personality.reply.name) {
    const rPerso = personality.reply; //get personality

    //get interaction options
    const content = options.getString(rPerso.stringOption.name, false);
    const attachment = options.getAttachment(
      rPerso.attachmentOption.name,
      false
    );
    const toSpoil = options.getBoolean(rPerso.spoilOption.name, false);
    const url = options.getString(rPerso.urlOption.name);
    const toPing = options.getBoolean(rPerso.pingOption.name);

    //get message to reply
    const sliced = url.split("/");
    let message;
    try {
      message = await interaction.channel.messages.fetch(
        sliced[sliced.length - 1]
      );
    } catch (e) {
      console.log("botMessage message fetch error", e);
      try {
        const channel = await interaction.client.channels.fetch(
          sliced[sliced.length - 2]
        );
        message = await channel.messages.fetch(sliced[sliced.length - 1]);
      } catch (e2) {
        console.log("botMessage channel/message fetch error", e2);
        interactionReply(interaction, personality.wrongUrl);
        return;
      }
    }

    //create message payload according to interaction options
    const payload = {};
    if (content) payload.content = content;
    if (toSpoil && attachment) {
      attachment.setSpoiler(toSpoil);
      payload.files = [attachment];
    } else if (attachment) payload.files = [attachment];
    toPing
      ? (payload.allowedMentions = { repliedUser: true })
      : (payload.allowedMentions = { repliedUser: false });

    //send reply
    if (Object.values(payload).length !== 0) {
      message.reply(payload);
      interactionReply(interaction, rPerso.sent);
    } else interactionReply(interaction, personality.empty);
  }
};

const botMessage = {
  command,
  action,
  help: () => {
    return PERSONALITY.getCommands().botMessage.help;
  },
  admin: true,
  sentinelle: false,
};

export default botMessage;
