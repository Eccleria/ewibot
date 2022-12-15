import Canvas from "canvas";
import dayjs from "dayjs";
import GIFEncoder from "gif-encoder-2";

import { MessageAttachment } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import path from "path";
import fs from "fs";

import { PERSONALITY } from "../personality.js";
import { interactionReply } from "./utils.js";

// jsons import
import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("static/commons.json"));

//personality
const personality = PERSONALITY.getCommands().concrete;

//COMMAND
const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getCommands().concrete.name)
  .setDescription(PERSONALITY.getCommands().concrete.description)
  .addUserOption((option) =>
    option
      .setName(PERSONALITY.getCommands().concrete.userOption.name)
      .setDescription(PERSONALITY.getCommands().concrete.userOption.description)
      .setRequired(true)
  )
  .addBooleanOption((option) =>
    option
      .setName(PERSONALITY.getCommands().concrete.booleanOption.name)
      .setDescription(
        PERSONALITY.getCommands().concrete.booleanOption.description
      )
      .setRequired(false)
  );

const action = async (object, type) => {
  //action to execute when command is fired
  const cPerso = PERSONALITY.getCommands().concrete;
  const { channel, client } = object;

  let buffer;

  const interaction = object;
  const options = interaction.options;

  //get options
  const force = options.getBoolean(cPerso.booleanOption.name);
  let user;
  try {
    user = options.getUser(cPerso.userOption.name);
  } catch (e) {
    interactionReply(interaction, personality.errorMention);
    console.log("concrete error", e);
    return;
  }

  await interaction.deferReply();
  const recipient = await client.users.fetch(user.id); //get guildMember from user id

  const self = process.env.CLIENTID;
  const currentServer = commons.find(
    ({ guildId }) => guildId === channel.guild.id
  );

  const gifsPath = path.join(
    path.resolve(path.dirname("")),
    "concrete",
    "gifs"
  );
  const dir = fs.readdirSync(gifsPath);

  const gifExists = dir.includes(`${recipient.id}.gif`);

  if (!gifExists || force) {
    //If not in db or --force, must create/recreate the gif
    const canvas = Canvas.createCanvas(339, 480); // Canvas creation
    const context = canvas.getContext("2d"); // context allows canvas further modification

    const basicPath = path.join(
      path.resolve(path.dirname("")),
      "concrete",
      "jpgs"
    );

    const encoder = new GIFEncoder(canvas.width, canvas.height); // width, heigth
    encoder.setDelay(33); //delay between each gif frame in ms
    encoder.start();

    const avatar = await Canvas.loadImage(
      // Load recipient avatar
      recipient.displayAvatarURL({ format: "jpg" })
    );

    for (let i = 100; i < 150; i++) {
      // gif creation frame by frame
      const path = i.toString().padStart(4, "0");
      const picture = await Canvas.loadImage(`${basicPath}/frame-${path}.jpg`);
      context.drawImage(picture, 0, 0, canvas.width, canvas.height); // add background
      context.save(); //Save the general configuration

      //draw circle
      context.beginPath(); // Pick up the pen
      context.arc(160, 360, 40, 0, Math.PI * 2, true); // Start the arc to form a circle
      context.closePath(); // Put the pen down
      context.clip(); // Clip off the region you drew on

      //draw avatar until the concrete block overlap it
      if (i < 131) context.drawImage(avatar, 120, 320, 80, 80);

      context.restore(); //Go back to the general contribution

      encoder.addFrame(context);
    }
    encoder.finish();

    buffer = encoder.out.getData(); //Recover the gif
    fs.writeFileSync(`${gifsPath}/${recipient.id}.gif`, buffer); //Write the gif locally
  } else buffer = fs.readFileSync(`${gifsPath}/${recipient.id}.gif`);

  const attachment = new MessageAttachment(buffer, cPerso.fileName);
  const sentMessage = await object.editReply({ files: [attachment] });

  if (recipient.id === self) await sentMessage.react(currentServer.edouin);
};

const concrete = {
  name: "concrete",
  command: command,
  action,
  help: (interaction) => {
    interaction.reply({
      content: personality.help,
      ephemeral: true,
      allowed_mentions: { parse: [] },
    });
  },
  admin: false,
  releaseDate: dayjs("12-15-2022", "MM-DD-YYYY"),
  sentinelle: false,
};

export default concrete;
