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
    .setTimestamp()
    .addFields({ name: perso.author, value: user.username, inline: true });

  expect(setupEmbed(color, perso, user, "user")).toStrictEqual(correctEmbed);
});
