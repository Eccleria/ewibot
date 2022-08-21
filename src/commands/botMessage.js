import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord.js";

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
          .setName("ci-joint")
          .setDescription("Pi�ce jointe")
          .setRequired(false)
      )
  )
  .addSubcommand((command) => 
    command
      .setName("reply")
      .setDescription("R�ponse d'Ewibot � un message.")
  );

const action = (interaction) => {

};

const botMessage = {
  command,
  action,
  help: () => {
    return PERSONALITY.getCommands().botMessage.help;
  },
  admin: true
};

export default botMessage;
