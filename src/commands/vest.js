import { SlashCommandBuilder, AttachmentBuilder } from "discord.js";
import { PERSONALITY } from "../personality.js";
import { interactionReply } from "../helpers/index.js";
import Canvas from "canvas";
import path from "path";
import fs from "fs";
import { interactionEditReply } from "./polls/pollsUtils.js";

const command = new SlashCommandBuilder()
    .setName(PERSONALITY.getCommands().vest.name)
    .setDescription(PERSONALITY.getCommands().vest.description)
    .addUserOption((option) => 
      option
        .setName(PERSONALITY.getCommands().vest.userOption.name)
        .setDescription(PERSONALITY.getCommands().vest.userOption.description)
        .setRequired(true)
    );

const action = async (interaction) => {
    const perso = PERSONALITY.getCommands().vest;
    const {client, options} = interaction;
    
    await interaction.deferReply();
    const user = options.getUser(perso.userOption.name);
    const target = await client.users.fetch(user.id); //get guildMember from user id

    //get pp hash
    const url = target.displayAvatarURL({ extension: "png" });
    const urlHash = url.split(`${target.id}/`)[1].split('.')[0];
    const fileName = `${target.id}-${urlHash}.png`;
    console.log("target image url", [url], [urlHash]);

    //check if older image exists
    const pngsPath = path.join(
        path.resolve(path.dirname("")),
        "pics",
        "vest",
        "pngs"
    );
    const dir = fs.readdirSync(pngsPath);
    const gifExists = dir.includes(fileName);

    //build image
    if (!gifExists) {
        const canvas = Canvas.createCanvas(1078, 1260); // Canvas creation
        const context = canvas.getContext("2d"); // context allows canvas further modification
        const avatar = await Canvas.loadImage(
            // Load target avatar
            target.displayAvatarURL({ extension: "png" })
        );
        //add background to canvas
        const basicPath = path.join(
            path.resolve(path.dirname("")),
            "pics",
            "vest"
        );
        const picture = await Canvas.loadImage(`${basicPath}/Gilet pare-balles perdues.png`);
        context.drawImage(picture, 0, 0, canvas.width, canvas.height); //add background
        context.save(); //Save the general configuration

        //draw circle
        context.beginPath(); //Pick up the pen
        context.arc(550, 430, 80, 0, Math.PI * 2, true); //Start the arc to form a circle
        context.closePath(); //Put the pen down
        context.clip(); //Clip off the region you drew on

        //add pp
        context.drawImage(avatar, 470, 350, 160, 160);
        context.restore(); //Go back to the general contribution

        const buffer = canvas.toBuffer("image/png");
        fs.writeFileSync(`${pngsPath}/${fileName}`, buffer); //Write the gif locally
        const attachment = new AttachmentBuilder(buffer, {name: "test.png"});
        interactionEditReply(interaction, {content: perso.sent, files: [attachment]});
    }
    else {
        const buffer = fs.readFileSync(`${pngsPath}/${fileName}`);
        const attachment = new AttachmentBuilder(buffer, {name: "test.png"});
        interactionEditReply(interaction, {content: perso.sent, files: [attachment]});
    }
};

const vest = {
    command,
    action,
    help: (interaction) => {
        const perso = PERSONALITY.getCommands().stats;
        interactionReply(interaction, perso.help);
    },
    admin: false,
    releaseDate: null,
    sentinelle: false,
    subcommands: ["vest"],
};
    
export default vest;
