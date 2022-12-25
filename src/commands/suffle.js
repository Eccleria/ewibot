import { SlashCommandBuilder } from "@discordjs/builders";
import { PERSONALITY } from "../personality";
import { interactionReply } from "./utils";

const command = new SlashCommandBuilder()
    .setName(PERSONALITY.getCommands().shuffle.name)
    .setDescription(PERSONALITY.getCommands().shuffle.description)
    .setDefaultMemberPermissions(0x0000010000000000);

const shuffle = {
    name: "shuffle",
    command: command,
    action,
    help: (interaction) => {
        const content = PERSONALITY.getCommands().shuffle.help;
        interactionReply(interaction, content);
    },
    admin: true,
    releaseDate: null, //dayjs("01-01-2023", "MM-DD-YYYY"),
    sentinelle: false,
    status: PERSONALITY.getCommands().shuffle.startstop.stop,
    waitingTime: 10 * 60 * 1000, //10 min
};

export default shuffle;

/*
//Test suffle color
setTimeout(async (client, commons) => {
  console.log("end timeout")
  setInterval(async (client, commons) => {
    console.log("end interval")
    await shuffleRoleColor(client, commons)
  }, 5000, client, commons)
}, 3000, client, commons)

const colorList = ["#e74c3c", "#f1c40f", "#3498db", "#2ecc71", "#9b59b6", "#1abc9c"]; //Orange, yellow, blue, green, purple, cyan

export const shuffleRoleColor = async (client, commons) => {
  const currentServer = commons.find((element) => element.name = "test")
  const roles = Object.values(currentServer.roles); // list of roles
  const guild = await client.guilds.fetch(currentServer.guildId)
  let colorToApply = colorList;
  roles.forEach(async (roleData) => {
    const role = await guild.roles.fetch(roleData.roleId);
    const rd = Math.round((colorToApply.length - 1) * Math.random());
    role.setColor(colorToApply[rd]);
    colorToApply = [...colorToApply.slice(0, rd), ...colorToApply.slice(rd + 1)];
  })
}

*/