import Canvas from "canvas";
import dayjs from "dayjs";
import GIFEncoder from "gif-encoder-2";
import path from "path";
import fs from "fs";

import { AttachmentBuilder, MessageFlags } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { interactionReply } from "../helpers/index.js";
import { COMMONS } from "../commons.js";
import { PERSONALITY } from "../personality.js";

//personality
const personality = PERSONALITY.getPersonality().concrete;

//COMMAND
const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getPersonality().concrete.name)
  .setDescription(PERSONALITY.getPersonality().concrete.description)
  .addUserOption((option) =>
    option
      .setName(PERSONALITY.getPersonality().concrete.userOption.name)
      .setDescription(PERSONALITY.getPersonality().concrete.userOption.description)
      .setRequired(true),
  )
  .addBooleanOption((option) =>
    option
      .setName(PERSONALITY.getPersonality().concrete.booleanOption.name)
      .setDescription(
        PERSONALITY.getPersonality().concrete.booleanOption.description,
      )
      .setRequired(false),
  );

const action = async (object) => {
  //action to execute when command is fired
  const cPerso = PERSONALITY.getPersonality().concrete;
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
  const target = await client.users.fetch(user.id); //get guildMember from user id

  const self = process.env.CLIENTID;
  const currentServer = COMMONS.fetchFromGuildId(channel.guild.id);

  const gifsPath = path.join(
    path.resolve(path.dirname("")),
    "pics",
    "concrete",
    "gifs",
  );
  const dir = fs.readdirSync(gifsPath);

  const url = target.displayAvatarURL({ extension: "png" });
  const urlHash = url.includes(target.id)
    ? url.split(`${target.id}/`)[1].split(".")[0]
    : "0";
  const fileName = `${target.id}-${urlHash}.gif`;
  const gifExists = dir.reduce((acc, cur) => {
    if (cur.includes(fileName)) return true;
    else if (cur.startsWith(target.id)) {
      fs.unlinkSync(`${gifsPath}/${cur}`);
      return false;
    }
    return acc;
  }, false);

  if (!gifExists || force) {
    //If not in db or --force, must create/recreate the gif
    const canvas = Canvas.createCanvas(339, 480); // Canvas creation
    const context = canvas.getContext("2d"); // context allows canvas further modification

    const jpgPath = path.join(
      path.resolve(path.dirname("")),
      "pics",
      "concrete",
      "jpgs",
    );

    const encoder = new GIFEncoder(canvas.width, canvas.height); // width, heigth
    encoder.setDelay(33); //delay between each gif frame in ms
    encoder.start();

    const avatar = await Canvas.loadImage(url);

    for (let i = 100; i < 150; i++) {
      // gif creation frame by frame
      const path = i.toString().padStart(4, "0");
      const picture = await Canvas.loadImage(`${jpgPath}/frame-${path}.jpg`);
      context.drawImage(picture, 0, 0, canvas.width, canvas.height); // add background
      context.save(); //Save the general configuration

      //draw circle
      context.beginPath(); // Pick up the pen
      context.arc(160, 360, 40, 0, Math.PI * 2, true); // Start the arc to form a circle
      context.closePath(); // Put the pen down
      context.clip(); // Clip off the region you drew on

      //draw avatar until the concrete block overlap it
      if (i < 131) context.drawImage(avatar, 120, 320, 80, 80); //add avatar

      context.restore(); //Go back to the general contribution

      encoder.addFrame(context);
    }
    encoder.finish();

    buffer = encoder.out.getData(); //Recover the gif
    fs.writeFileSync(`${gifsPath}/${fileName}`, buffer); //Write the gif locally
  } else buffer = fs.readFileSync(`${gifsPath}/${fileName}`);

  const attachment = new AttachmentBuilder(buffer, { name: cPerso.fileName });
  const sentMessage = await object.editReply({ files: [attachment] });

  if (target.id === self) await sentMessage.react(currentServer.edouin);
};

const concrete = {
  name: "concrete",
  command: command,
  action,
  help: (interaction) => {
    interaction.reply({
      content: personality.help,
      flags: MessageFlags.Ephemeral,
      allowed_mentions: { parse: [] },
    });
  },
  admin: false,
  releaseDate: dayjs("12-15-2022", "MM-DD-YYYY"),
  sentinelle: false,
};

export default concrete;
