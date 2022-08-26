import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord-api-types/v9";
//import { ChannelType } from "discord.js"; //for discordjs v14

import { PERSONALITY } from "../personality.js";

const command = new SlashCommandBuilder()
  .setDefaultMemberPermissions(0)
  .setName("message")
  .setDescription("Envoyer un message � la place d'Ewibot.")
  .addSubcommand((command) =>
    command
      .setName("send")
      .setDescription("Envoi d'un message.")
      .addChannelOption((option) =>
        option
          .setName("salon")
          .setDescription("Salon dans lequel Ewibot enverra le message.")
          .setRequired(false)
          .addChannelTypes(ChannelType.GuildText)
      )
      .addStringOption((option) =>
        option
          .setName("texte")
          .setDescription("Contenu du message.")
          .setMinLength(1)
          .setRequired(false)
      )
      .addAttachmentOption((option) =>
        option
          .setName("piece-jointe")
          .setDescription("Pièce jointe à envoyer.")
          .setRequired(false)
      )
  )
  .addSubcommand((command) => 
    command
      .setName("reply")
      .setDescription("Réponse d'Ewibot à un message.")
      .addChannelOption((option) =>
        option
          .setName("salon")
          .setDescription("L'id du channel dans lequel il y a le message auquel Ewibot répondra.")
          .setRequired(true)
          .addChannelTypes(ChannelType.GuildText)
      )
      .addStringOption((option) =>
        option
          .setName("messageid")
          .setDescription("L'id du message auquel Ewibot répondra.")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("texte")
          .setDescription("Contenu du message.")
          .setMinLength(1)
          .setRequired(false)
      )
      .addAttachmentOption((option) =>
        option
          .setName("piece-jointe")
          .setDescription("Pièce jointe à envoyer.")
          .setRequired(false)
      )
  );

const action = (interaction) => {
  console.log(interaction);
  const options = interaction.options;
  const subcommand = options.getSubcommand();
  const messageId =
    subcommand === "reply" ? options.getNumber("messageid") : null; //
  const text = options.getString("texte"); //content to send
  const attachment = options.getAttachment("piece-jointe"); //attachment to send
  const channel = options.getChannel("salon")
    ? options.getChannel("salon")
    : interaction.channel; //channel where to send message

  console.log("subcommand", subcommand);
  console.log("messageId", messageId);
  console.log("text", text);
  console.log("attachment", attachment);
  console.log("channel", channel);
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
