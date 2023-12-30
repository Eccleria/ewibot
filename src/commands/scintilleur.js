import Canvas from "canvas";
import { SlashCommandBuilder } from "@discordjs/builders";
import { PERSONALITY } from "../personality";
import { interactionReply } from "../helpers/index.js";

const maxLength = 18;
const sizeX = 457;
const sizeY = 640;

/**
 * Compute circle values. 
 * @param {string} userId User id.
 * @param {number} circle 
 * @param {*} canExceed 
 * @returns 
 */
const getCircleValues = (userId, circle, canExceed) => {
  const idx = (circle - 1) * maxLength;
  let value;

  //radius
  value = Number(userId.slice(idx, idx + 2));
  const radius = (canExceed ? value * sizeX : value * sizeY) / 99 / 2;

  //posX
  value = Number(userId.slice(idx + 2, idx + 4));
  const posX =
    (canExceed ? value * (sizeY - 2 * radius) : value * (sizeX - 2 * radius)) /
      99 +
    radius;

  //posY
  value = Number(userId.slice(idx + 4, idx + 6));
  const posY = canExceed ? value * sizeX : value * sizeY;

  return [radius, posX, posY];
};

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getCommands().scintilleur.name)
  .setDescription(PERSONALITY.getCommands().scintilleur.description)
  .setDefaultMemberPermissions(0x0000010000000000); //only moderation staff - for test purpose

const action = (interaction) => {
  //get user information
  const userId = interaction.member.id;

  //compute test values
  const len = userId.length;
  const id =
    len >= maxLength
      ? userId.slice(0, maxLength)
      : userId + userId.slice(0, maxLength - len);
  const canExceed = Number(id[0]) % 2;

  //compute circles position/sizes
  /*const posSizes = */getCircleValues(id, 1, canExceed);

  //build test image
  const canvas = Canvas.createCanvas(sizeX, sizeY);
  const context = canvas.getContext("2d");

  context.arc();

  //send test image
};

const scintilleur = {
  action,
  command,
  help: (interaction) => {
    const personality = PERSONALITY.getCommands().scintilleur;
    interactionReply(interaction, personality.help);
  },
  admin: true,
  releaseDate: null,
  sentinelle: true,
};

export default scintilleur;
