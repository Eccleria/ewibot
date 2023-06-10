import { MessageEmbed } from "discord.js";
import { setupEmbed } from "../../src/admin/utils.js";
import basicDiscordJs from "../basicObjects.js";

const BDJ = new basicDiscordJs();

const perso = {
  author: "author",
  title: "title",
};

test("setupEmbed correct input", () => {
  const user = BDJ.getUser();
  const color = "DARK_BLUE";
  const correctEmbed = new MessageEmbed()
    .setColor(color)
    .setTitle(perso.title)
    .setTimestamp();

  //skip
  correctEmbed.setTimestamp();
  expect(setupEmbed(color, perso, null, "skip")).toStrictEqual(correctEmbed);

  //tag
  correctEmbed.setFields({ name: perso.author, value: user.userEmbed, inline: true });
  correctEmbed.setTimestamp();
  expect(setupEmbed(color, perso, user.userEmbed, "tag")).toStrictEqual(correctEmbed);
  
  //else
  const channel = BDJ.getChannel();
  correctEmbed.setFields({ name: perso.author, value: channel.name, inline: true });
  correctEmbed.setTimestamp();
  expect(setupEmbed(color, perso, channel)).toStrictEqual(correctEmbed);
  
  //user
  correctEmbed.setFields({ name: perso.author, value: user.username, inline: true });
  correctEmbed.setTimestamp();
  expect(setupEmbed(color, perso, user, "user")).toStrictEqual(correctEmbed);
  
  //user + desc
  perso.description = "description";
  correctEmbed.setDescription("description");
  correctEmbed.setTimestamp();
  expect(setupEmbed(color, perso, user, "user")).toStrictEqual(correctEmbed);
});
