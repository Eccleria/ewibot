import { MessageEmbed } from "discord.js";
import { PERSONALITY } from "../personality.js";

const action = (message) => {
  const embed1 = new MessageEmbed().setTitle("embed1");
  const embed2 = new MessageEmbed().setTitle("embed2");

  if (message.content.includes("--json")) {
    console.log("```javascript \n" + `"embed": ${embed1.toJSON()}` + "\n```")
    console.log(embed1.toJSON());
  } else message.reply({ embeds: [embed1, embed2] });
}

const embeds = {
  name: "embeds",
  action,
  help: () => {
    return PERSONALITY.getCommands().embeds.help;
  },
  admin: false,
};

export default embeds;