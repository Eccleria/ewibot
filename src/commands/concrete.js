import personalities from "../personnalities.json"
import Canvas from "canvas";
import GIFEncoder from "gif-encoder-2";
import { MessageAttachment } from "discord.js";
import { isConcreteRecipient } from "../helpers/index.js";

const replies = personalities.normal.commands;

const action = async (message, _personality, client) => {
  const { content, channel } = message; // author, 
  const db = client.db;
  const args = content.toLowerCase().split(" ");

  const recipient = args.length > 1 ? await client.users.fetch(args[1]) : -1; // find user from user id

  if (!isConcreteRecipient(db, recipient.id)) { //If not in db, must create the gif
    const canvas = Canvas.createCanvas(339, 480); // Canvas creation
    const context = canvas.getContext('2d'); // context allows canvas further modification
    
    const basicPath = "C:/Users/julie/Source/Repos/Titch88/ewibot/concrete/jpgs/frame-";

    const encoder = new GIFEncoder(canvas.width, canvas.height); // width, heigth
    encoder.setDelay(50); //delay between each gif frame in ms
    encoder.start();


    for (let i = 1; i < 44; i++) {
      const path = i <= 9 ? "0" + i.toString() : i.toString();
      const picture = await Canvas.loadImage(basicPath + path + ".jpg");
      context.drawImage(picture, 0, 0, canvas.width, canvas.height); // add background
      context.save()

      //draw circle
      context.beginPath(); // Pick up the pen
      context.arc(170, 400, 80, 0, Math.PI * 2, true); // Start the arc to form a circle
      context.closePath(); // Put the pen down
      context.clip(); // Clip off the region you drew on

      //draw avatar
      const avatar = recipient !== -1 ? await Canvas.loadImage(recipient.displayAvatarURL({ format: 'jpg' })) : null;
      context.drawImage(avatar, 89, 320, 160, 160);
      context.restore();

      encoder.addFrame(context);
    }
    encoder.finish();

    const buffer = encoder.out.getData();
    const attachment = new MessageAttachment(buffer, 'concrete.gif');//'concrete-' + `${recipient.toString()}` + '.gif');
    

    /*
    const picture = await Canvas.loadImage("C:/Users/julie/Source/Repos/Titch88/ewibot/concrete/jpgs/frame-01.jpg");
    context.drawImage(picture, 0, 0, canvas.width, canvas.height);

    context.beginPath(); // Pick up the pen
    context.arc(170, 400, 80, 0, Math.PI * 2, true); // Start the arc to form a circle
    context.closePath(); // Put the pen down
    context.clip(); // Clip off the region you drew on

    const avatar = recipient !== -1 ? await Canvas.loadImage(recipient.displayAvatarURL({ format: 'jpg' })) : null;
    context.drawImage(avatar, 89, 320, 160, 160);

    const attachment = new MessageAttachment(canvas.toBuffer(), 'profile-image.png');
    */
    await channel.send({ files: [attachment] });
  }
};

const concrete = {
  name: "concrete",
  action,
  help: () => {
    return replies.concrete.help;
  },
  admin: false
}

export default concrete;