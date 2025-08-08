import {
  ActionRowBuilder,
  ButtonStyle,
  Colors,
  ContainerBuilder,
  MessageFlags,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
} from "discord.js";
import { PERSONALITY } from "../../personality.js";

import { interactionReply } from "../../helpers/index.js";
import { createButton } from "../utils.js";
import dayjs from "dayjs";

export const createChallenge = async (interaction, title, challenge) => {
  const perso = PERSONALITY.getPersonality().challenge.challenge;
  const channel = await interaction.client.channels.fetch(
    interaction.channelId,
  );

  //build the first container for the challenge message
  //create basic objects
  const separator = new SeparatorBuilder().setSpacing(
    SeparatorSpacingSize.Large,
  );
  const firstSection = new SectionBuilder();
  const secondSection = new SectionBuilder();

  //add author
  const avatarUrl = interaction.user.avatarURL();
  if (avatarUrl) {
    const authorThumbnail = new ThumbnailBuilder().setURL(avatarUrl);
    firstSection.setThumbnailAccessory(authorThumbnail);
  }

  //add challenge title
  const titleText = new TextDisplayBuilder()
    .setContent(perso.title + '\n' + perso.description);
  const authorText = new TextDisplayBuilder().setContent(
    perso.author + interaction.user.toString(),
  );
  firstSection.addTextDisplayComponents(titleText, authorText);

  //add challenge title and description
  const button = createButton(
    perso.pButton.customId,
    perso.pButton.label,
    ButtonStyle.Success,
  );
  secondSection.setButtonAccessory(button);
  const challengeTitle = new TextDisplayBuilder().setContent("## " + title);
  const challengeText = new TextDisplayBuilder().setContent(challenge);
  const participantCountText = new TextDisplayBuilder().setContent(
    perso.participantCount[0] + '0' + perso.participantCount[1],
  );
  secondSection.addTextDisplayComponents(challengeTitle, challengeText, participantCountText);

  //create setup button
  const settingButton = createButton(
    perso.sButton.customId,
    null,
    ButtonStyle.Secondary,
    "⚙️",
  );
  const actionRow = new ActionRowBuilder().addComponents(settingButton);

  //build the second container for the challenge message
  //compute timeout
  const timeout = 24 * 60 * 60 * 1000; //1day in ms
  const challengeDate = dayjs().millisecond(timeout);
  const cDateUnix = challengeDate.unix();
  const hammertimeText = `<t:${cDateUnix}:F> soit <t:${cDateUnix}:R>`;
  const dateTextField = new TextDisplayBuilder().setContent(
    perso.hammertime + hammertimeText,
  );

  //assemble the message
  const color = PERSONALITY.getColors().choices[18].value;
  const container = new ContainerBuilder()
    .setAccentColor(Colors[color])
    .addSectionComponents(firstSection)
    .addSeparatorComponents(separator)
    .addSectionComponents(secondSection)
    .addSeparatorComponents(separator)
    .addActionRowComponents(actionRow);
  const hammertimeContainer = new ContainerBuilder()
    .setAccentColor(Colors[color])
    .addTextDisplayComponents(dateTextField);

  channel.send({
    allowed_mentions: { parse: [] },
    flags: MessageFlags.IsComponentsV2,
    components: [container, hammertimeContainer],
  });
};

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getPersonality().challenge.name)
  .setDescription(PERSONALITY.getPersonality().challenge.description);

const action = (interaction) => {
  const perso = PERSONALITY.getPersonality().challenge;

  //create the different components
  //create section components
  const textC = new TextDisplayBuilder().setContent(perso.selectMenu.title);
  const thumbnail = new ThumbnailBuilder().setURL(
    "https://cdn.discordapp.com/attachments/935180557770448956/1384579139713106083/image.png",
  );

  //create section
  const section = new SectionBuilder()
    .setThumbnailAccessory(thumbnail)
    .addTextDisplayComponents(textC);

  //select menu creation
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(perso.selectMenu.customId)
    .addOptions(perso.selectMenu.choices)
    .setMaxValues(1)
    .setMinValues(1)
    .setPlaceholder(perso.selectMenu.placeholder);
  console.log(selectMenu);
  const actionRow = new ActionRowBuilder().addComponents(selectMenu);
  //console.log(actionRow);

  //create container
  const color = PERSONALITY.getColors().choices[18].value;
  const container = new ContainerBuilder()
    .setAccentColor(Colors[color])
    .addSectionComponents(section)
    .addActionRowComponents(actionRow);

  interaction.reply({
    flags: MessageFlags.IsComponentsV2 + MessageFlags.Ephemeral,
    components: [container],
  });
};

const challenge = {
  action,
  command,
  help: (interaction) => {
    interactionReply(interaction, PERSONALITY.getPersonality().challenge.help);
  },
  admin: false,
  releaseDate: null,
  sentinelle: false,
};

export default challenge;
