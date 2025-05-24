import {
  ActionRowBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
} from "discord.js";
import { PERSONALITY } from "../../personality.js";
import { interactionReply } from "../../helpers/index.js";
import { createButton } from "../utils.js";

export const frontalierAction = async (interaction) => {
  //send figth interaction

  //get options
  const perso = PERSONALITY.getCommands().games.frontalier.hsa;
  const { client, options, user } = interaction;

  const targetUser = options.getUser(perso.userOption.name, false);
  let finalUser; //user to fight with

  //check target
  if (
    !targetUser ||
    targetUser.id === user.id ||
    targetUser.id === client.user.id
  ) {
    //fight against ewibot
    finalUser = client.user; //Ewibot user
  }

  //create the fight embed
  const ePerso = perso.embed;
  const embed = new EmbedBuilder()
    .setColor(Colors.Yellow)
    .setTitle(perso.title)
    .setAuthor({ name: user.username, iconURL: user.avatarURL() });
  const embedContent =
    `<@${finalUser.id}>` + ePerso.text + `<@${interaction.user.id}> !`;
  embed.addFields({ name: ePerso.name, value: embedContent });

  //create buttons
  const bPerso = perso.buttons;
  const hButton = createButton(bPerso.h_id, null, ButtonStyle.Secondary, "🐴");
  const sButton = createButton(bPerso.s_id, null, ButtonStyle.Secondary, "🪓");
  const aButton = createButton(bPerso.a_id, null, ButtonStyle.Secondary, "🛡️");
  const aRow = new ActionRowBuilder().addComponents(hButton, sButton, aButton);

  //send the data
  const msg = await interaction.channel.send({
    embeds: [embed],
    components: [aRow],
  });

  //reply to the original interaction
  interactionReply(interaction, perso.sent);

  //save data in client
  client.games.frontalier.hsa.push({
    authorId: user.id,
    authorScore: 0,
    messageId: msg.id,
    targetId: finalUser.id,
    targetScore: 0,
  });
};
