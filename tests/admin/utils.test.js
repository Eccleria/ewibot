import { MessageEmbed } from "discord.js";
import { expect, test } from "@jest/globals";

import { setupEmbed } from "../../src/admin/utils.js";
import basicDiscordJs from "../basicObjects.js";

const BDJ = new basicDiscordJs();

const perso = {
  author: "author",
  title: "title",
};

test("setupEmbed correct input", () => {
  //setup test values
  const channel = BDJ.getChannel();
  const user = BDJ.getUser();
  const color = "DARK_BLUE";
  const correctEmbed = new MessageEmbed()
    .setColor(color)
    .setTitle(perso.title);
  correctEmbed.timestamp = expect.any(Number); //useless to check that value

  //test cases
  //skip
  expect(setupEmbed(color, perso, null, "skip")).toStrictEqual(correctEmbed);

  //tag
  correctEmbed.setFields({ name: perso.author, value: user.userEmbed, inline: true });
  expect(setupEmbed(color, perso, user.userEmbed, "tag")).toStrictEqual(correctEmbed);
  
  //else
  correctEmbed.setFields({ name: perso.author, value: channel.name, inline: true });
  expect(setupEmbed(color, perso, channel)).toStrictEqual(correctEmbed);
  
  //user
  correctEmbed.setFields({ name: perso.author, value: user.username, inline: true });
  expect(setupEmbed(color, perso, user, "user")).toStrictEqual(correctEmbed);
  
  //user + desc
  perso.description = "description"; //must not be set before
  correctEmbed.setDescription(perso.description);
  expect(setupEmbed(color, perso, user, "user")).toStrictEqual(correctEmbed);
});
