import { SlashCommandBuilder } from "@discordjs/builders";
import { AttachmentBuilder, ChannelType } from "discord.js";
import { interactionReply, isAdmin } from "../helpers/index.js";
import { PERSONALITY } from "../personality.js";

const command = new SlashCommandBuilder()
  .setDefaultMemberPermissions(0)
  .setName(PERSONALITY.getPersonality().botMessage.name)
  .setDescription(PERSONALITY.getPersonality().botMessage.description)
  .setDefaultMemberPermissions(0x0000010000000000)
  .addSubcommand((command) =>
    command //send
      .setName(PERSONALITY.getPersonality().botMessage.send.name)
      .setDescription(PERSONALITY.getPersonality().botMessage.send.description)
      .addChannelOption((option) =>
        option
          .setName(PERSONALITY.getPersonality().botMessage.send.channelOption.name)
          .setDescription(
            PERSONALITY.getPersonality().botMessage.send.channelOption.description,
          )
          .setRequired(false)
          .addChannelTypes(ChannelType.GuildText),
      )
      .addStringOption((option) =>
        option
          .setName(PERSONALITY.getPersonality().botMessage.send.stringOption.name)
          .setDescription(
            PERSONALITY.getPersonality().botMessage.send.stringOption.description,
          )
          .setMinLength(1)
          .setRequired(false),
      )
      .addAttachmentOption((option) =>
        option
          .setName(
            PERSONALITY.getPersonality().botMessage.send.attachmentOption.name,
          )
          .setDescription(
            PERSONALITY.getPersonality().botMessage.send.attachmentOption
              .description,
          )
          .setRequired(false),
      )
      .addBooleanOption((option) =>
        option
          .setName(PERSONALITY.getPersonality().botMessage.send.booleanOption.name)
          .setDescription(
            PERSONALITY.getPersonality().botMessage.send.booleanOption.description,
          )
          .setRequired(false),
      ),
  )
  .addSubcommand((command) =>
    command //reply
      .setName(PERSONALITY.getPersonality().botMessage.reply.name)
      .setDescription(PERSONALITY.getPersonality().botMessage.reply.description)
      .addStringOption((option) =>
        option //url
          .setName(PERSONALITY.getPersonality().botMessage.reply.urlOption.name)
          .setDescription(
            PERSONALITY.getPersonality().botMessage.reply.urlOption.description,
          )
          .setMinLength(1)
          .setRequired(true),
      )
      .addStringOption((option) =>
        option //text
          .setName(PERSONALITY.getPersonality().botMessage.reply.stringOption.name)
          .setDescription(
            PERSONALITY.getPersonality().botMessage.reply.stringOption.description,
          )
          .setMinLength(1)
          .setRequired(false),
      )
      .addAttachmentOption((option) =>
        option //attachment
          .setName(
            PERSONALITY.getPersonality().botMessage.reply.attachmentOption.name,
          )
          .setDescription(
            PERSONALITY.getPersonality().botMessage.reply.attachmentOption
              .description,
          )
          .setRequired(false),
      )
      .addBooleanOption((option) =>
        option //toSpoil
          .setName(PERSONALITY.getPersonality().botMessage.reply.spoilOption.name)
          .setDescription(
            PERSONALITY.getPersonality().botMessage.reply.spoilOption.description,
          )
          .setRequired(false),
      )
      .addBooleanOption((option) =>
        option //toPing
          .setName(PERSONALITY.getPersonality().botMessage.reply.pingOption.name)
          .setDescription(
            PERSONALITY.getPersonality().botMessage.reply.pingOption.description,
          )
          .setRequired(false),
      ),
  );

const action = async (interaction) => {
  //console.log(interaction);
  const options = interaction.options;
  const subcommand = options.getSubcommand();
  const personality = PERSONALITY.getPersonality().botMessage;

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
    const foundAttachment = options.getAttachment(
      sPerso.attachmentOption.name,
      false,
    );
    const attachment = foundAttachment
      ? AttachmentBuilder.from(foundAttachment)
      : null;

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
      false,
    );
    const toSpoil = options.getBoolean(rPerso.spoilOption.name, false);
    const url = options.getString(rPerso.urlOption.name);
    const toPing = options.getBoolean(rPerso.pingOption.name);

    //get message to reply
    const sliced = url.split("/");
    let message;
    try {
      message = await interaction.channel.messages.fetch(
        sliced[sliced.length - 1],
      );
    } catch (e) {
      console.log("botMessage message fetch error", e);
      try {
        const channel = await interaction.client.channels.fetch(
          sliced[sliced.length - 2],
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
  help: (interaction) => {
    const perso = PERSONALITY.getPersonality().botMessage;
    interactionReply(interaction, perso.help);
  },
  admin: true,
  sentinelle: false,
};

export default botMessage;
