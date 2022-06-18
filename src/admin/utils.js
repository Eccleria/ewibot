import { MessageEmbed } from "discord.js";

export const setupEmbed = (color, personality, object, type) => {
  //setup the embed object
  const embed = new MessageEmbed()
    .setColor(color)
    .setTitle(personality.title)
    .setTimestamp();

  if (personality.description) embed.setDescription(personality.description);

  if (type === "tag") {
    //add the user tag if required
    embed.addField(personality.author, object.tag, true);
  } else if (type === "skip") return embed;
  else embed.addField(personality.author, object.name, true); //otherwise, add the object name (for channels, roles, ...)
  return embed;
};
