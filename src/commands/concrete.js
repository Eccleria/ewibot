import personalities from "../personnalities.json"
import Canvas from "canvas";
import { MessageAttachment } from "discord.js";
import { parseGIF } from "gifuct-js";

const replies = personalities.normal.commands;

/*
const editConcrete = (recipient) => {

};
*/

const action = async (message, personality, client) => {
  const { content, author, channel } = message;
  const args = content.toLowerCase().split(" ");
  console.log("args", args);
  const recipient = client.users.fetch(args[1]); // find user from user id

  //const gif = "https://tenor.com/view/gna-gna-gna-gif-11638410";

  const canvas = Canvas.createCanvas(339, 480);
  const context = canvas.getContext('2d');
  //const gif = await Canvas.loadImage('./concrete.gif');
  const test = parseGIF()
  const gif = await Canvas.loadImage("C:/Users/julie/Source/Repos/Titch88/ewibot/src/concrete.gif");
  context.drawImage(gif, 0, 0, canvas.width, canvas.height);
  const attachment = new MessageAttachment(canvas.toBuffer(), 'pic.gif');//'concrete-' + `${recipient.toString()}` + '.gif');
  console.log(canvas);
  await channel.send({ files: [canvas.toBuffer()] });
  /*
  const embedMessage = new MessageEmbed()
    .setTitle("Salut")
    .setImage(gif);
    */
  //await channel.send(personality.concrete.author + `${author.toString()}` + gif);
  //await channel.send({ embeds: [embedMessage] });
  /*
  if (args[1]) {
    const recipient = client.cache.fetch(args[1]); // find user from user id
    const embed = new MessageEmbed().setImage(["https://tenor.com/wrdT.gif"]);
    await recipient.send(" tu viens de te faire bétonner ");
  }
  */
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