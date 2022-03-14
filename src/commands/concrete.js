import Canvas from "canvas";
import GIFEncoder from "gif-encoder-2";
import { MessageAttachment } from "discord.js";
import path from "path";
import fs from "fs";

import { PERSONALITY } from "./personality.js";

const action = async (message, client) => {
  const { channel, mentions } = message;

  if (mentions.users.size !== 1) {
    message.reply("Un seul argument attendu : une mention");
    return;
  }

  channel.sendTyping();

  const recipient = await client.users.fetch(mentions.users.first().id); // find user from user id

  const gifsPath = path.join(
    path.resolve(path.dirname("")),
    "concrete",
    "gifs"
  );

  const dir = fs.readdirSync(gifsPath);

  if (!dir.includes(`${recipient.id}.gif`)) {
    //If not in db, must create the gif
    //const gif = "https://tenor.com/view/gna-gna-gna-gif-11638410";
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
      recipient.displayAvatarURL({ format: "jpg" })
    );

    for (let i = 100; i < 150; i++) {
      const path = i.toString().padStart(4, "0");
      const picture = await Canvas.loadImage(`${basicPath}/frame-${path}.jpg`);
      context.drawImage(picture, 0, 0, canvas.width, canvas.height); // add background
      context.save();

      //draw circle
      context.beginPath(); // Pick up the pen
      context.arc(160, 360, 40, 0, Math.PI * 2, true); // Start the arc to form a circle
      context.closePath(); // Put the pen down
      context.clip(); // Clip off the region you drew on

      //draw avatar until the concrete block overlap it
      if (i < 131) context.drawImage(avatar, 120, 320, 80, 80);

      context.restore();

      encoder.addFrame(context);
    }
    encoder.finish();

    const buffer = encoder.out.getData();

    fs.writeFileSync(`${gifsPath}/${recipient.id}.gif`, buffer);

    const attachment = new MessageAttachment(buffer, "concrete.gif"); //'concrete-' + `${recipient.toString()}` + '.gif');

    await channel.send({ files: [attachment] });
  } else {
    const buffer = fs.readFileSync(`${gifsPath}/${recipient.id}.gif`);

    const attachment = new MessageAttachment(buffer, "concrete.gif");
    await channel.send({ files: [attachment] });
  }
};

const concrete = {
  name: "concrete",
  action,
  help: () => {
    return PERSONALITY.commands.concrete.help;
  },
  admin: false,
};

export default concrete;
