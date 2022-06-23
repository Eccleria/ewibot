import { PERSONALITY } from "../personality.js";
import { MessageEmbed } from "discord.js";

const action = (message) => {
  const user = message.author;
  const embed = new MessageEmbed()
    .setTitle("Test")
    .addField("Auteur", user.toString(), true)
    .addField("Salon", message.channel.toString(), true);

  message.channel.send({ embeds: [embed], allowed_mentions: { "parse": [] } });
};

const test = {
  name: "test",
  action,
  help: () => {
    return PERSONALITY.getCommands().test.help;
  },
  admin: false,
};

export default test;
