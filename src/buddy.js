import { Colors, EmbedBuilder } from "discord.js";
import { COMMONS } from "./commons.js";

export const firstReactToAccountabilityMessage = (message) => {
  const commons = COMMONS.getShared();

  if (message.content.includes(":"))
    message.react(commons.accountabilityBuddy.toDoEmoteId);
};

export const accountabilityReactHandler = (messageReaction, user) => {
  messageReaction.remove(); //remove all users from this reaction

  const commons = COMMONS.getShared();
  const aCmn = commons.accountabilityBuddy;
  const { message } = messageReaction;
  const { content } = message;

  //process message content
  const lines = content.split("\n");
  console.log("lines", lines);
  const processed = lines.reduce((acc, cur) => {
    const trimmed = " " + cur.trim();
    
    if (cur.includes(":")) return [...acc, aCmn.starEmoteId + trimmed];
    else if (cur.length) return [...acc, aCmn.toDoEmoteId + trimmed];
    else return [...acc, cur];
  }, []);
  console.log("processed", processed);
  const newContent = processed.join("\n");

  //create embed
  const embed = new EmbedBuilder()
    .setAuthor({ name: user.username, iconURL: user.avatarURL() })
    .setColor(Colors.White)
    .setDescription(newContent)
    .setTimestamp();

  //send content
  message.reply({embeds: [embed]});
};
