import { SlashCommandBuilder, AttachmentBuilder } from "discord.js";
import Canvas from "canvas";
import path from "path";
import fs from "fs";
import {
  fetchMember,
  interactionReply,
} from "ewilib";

import { PERSONALITY } from "../personality.js";
import {
  removeEmote,
} from "../helpers/index.js";
import { interactionEditReply } from "./polls/pollsUtils.js";

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getPersonality().vest.name)
  .setDescription(PERSONALITY.getPersonality().vest.description)
  .addUserOption((option) =>
    option
      .setName(PERSONALITY.getPersonality().vest.userOption.name)
      .setDescription(PERSONALITY.getPersonality().vest.userOption.description)
      .setRequired(true),
  )
  .addBooleanOption((option) =>
    option
      .setName(PERSONALITY.getPersonality().vest.forceOption.name)
      .setDescription(PERSONALITY.getPersonality().vest.forceOption.description)
      .setRequired(false),
  );

const action = async (interaction) => {
  const perso = PERSONALITY.getPersonality().vest;
  const { guild, options } = interaction;

  await interaction.deferReply();
  const user = options.getUser(perso.userOption.name);
  const target = await fetchMember(guild.members, user.id); //get guildMember from user id

  //get pp hash
  const url = target.displayAvatarURL({ extension: "png" });
  const separator = url.includes("guilds/") ? "avatars/" : `${target.id}/`;
  const urlHash = url.split(separator)[1].split(".")[0];
  const fileName = `${target.id}-${urlHash}.png`;
  console.log("target image url", [url], [urlHash]);

  //check if older image exists
  const pngsPath = path.join(
    path.resolve(path.dirname("")),
    "pics",
    "vest",
    "pngs",
  );
  const dir = fs.readdirSync(pngsPath);
  const gifExists = dir.reduce((acc, cur) => {
    if (cur.includes(fileName)) return true;
    else if (cur.startsWith(target.id)) {
      fs.unlinkSync(`${pngsPath}/${cur}`);
      return false;
    }
    return acc;
  }, false);

  //get force option if any
  const option = options.getBoolean(perso.forceOption.name);
  const force = option ? option : false;

  //build image
  if (!gifExists || force) {
    const canvas = Canvas.createCanvas(1078, 1260); // Canvas creation
    const context = canvas.getContext("2d"); // context allows canvas further modification
    const avatar = await Canvas.loadImage(
      // Load target avatar
      target.displayAvatarURL({ extension: "png" }),
    );
    //add background to canvas
    const basicPath = path.join(path.resolve(path.dirname("")), "pics", "vest");
    const picture = await Canvas.loadImage(
      `${basicPath}/Gilet pare-balles perdues.png`,
    );
    context.drawImage(picture, 0, 0, canvas.width, canvas.height); //add background
    context.save(); //Save the general configuration

    //draw circle
    context.beginPath(); //Pick up the pen
    context.arc(550, 440, 80, 0, Math.PI * 2, true); //Start the arc to form a circle
    context.closePath(); //Put the pen down
    context.clip(); //Clip off the region you drew on

    //add pp
    context.drawImage(avatar, 470, 360, 160, 160); //add avatar
    context.restore(); //Go back to the general contribution

    //add nickname
    const filtered = target.nickname
      ? removeEmote(target.nickname)
      : removeEmote(target.displayName);
    const text = filtered.length > 12 ? filtered.slice(0, 12) : filtered;

    context.font = applyText(canvas, text); //font size
    context.fillStyle = "#000000"; //font color
    context.translate(712, 490);
    context.rotate(Math.PI / 20);
    context.fillText(text, 0, 0); //write text

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(`${pngsPath}/${fileName}`, buffer); //Write the gif locally
    const attachment = new AttachmentBuilder(buffer, { name: "vest.png" });
    interactionEditReply(interaction, { files: [attachment] }, false);
  } else {
    const buffer = fs.readFileSync(`${pngsPath}/${fileName}`);
    const attachment = new AttachmentBuilder(buffer, { name: "vest.png" });
    interactionEditReply(interaction, { files: [attachment] }, false);
  }
};

/**
 * Compute proper font to fit text in canvas
 * @param {Canvas} canvas Canvas object
 * @param {string} text Text to write
 * @returns font with correct fontSize
 */
const applyText = (canvas, text) => {
  const context = canvas.getContext("2d");

  let fontSize = 60;
  do {
    // Assign the font to the context and decrement it so it can be measured again
    context.font = `${(fontSize -= 3)}px sans-serif`;
    // Compare pixel width of the text to the canvas minus the approximate avatar size
  } while (context.measureText(text).width > 190);

  return context.font;
};

const vest = {
  command,
  action,
  help: (interaction) => {
    const perso = PERSONALITY.getPersonality().vest;
    interactionReply(interaction, perso.help);
  },
  admin: false,
  releaseDate: null,
  sentinelle: false,
};

export default vest;
