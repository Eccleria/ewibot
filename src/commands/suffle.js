import { SlashCommandBuilder } from "@discordjs/builders";
import { PERSONALITY } from "../personality";
import { interactionReply } from "./utils";
//jsons import
import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("static/commons.json"));

const param = {
  status: PERSONALITY.getCommands().shuffle.startstop.stop,
  interval: null,
  waitingTime: 1 * 60 * 1000,
};

const colorList = ["#e74c3c", "#f1c40f", "#3498db", "#2ecc71", "#9b59b6", "#1abc9c"]; //Orange, yellow, blue, green, purple, cyan

const shuffleRoleColor = async (client) => {
  const server = commons.find(({ name }) =>
    process.env.DEBUG === "yes" ? name === "test" : name === "prod"
  );
  const roles = Object.values(server.roles); // list of roles
  const guild = await client.guilds.fetch(server.guildId)

  let colorToApply = colorList;
  roles.forEach(async (roleData) => {
    const role = await guild.roles.fetch(roleData.roleId);
    const rd = Math.round((colorToApply.length - 1) * Math.random());
    role.setColor(colorToApply[rd]);
    colorToApply = [...colorToApply.slice(0, rd), ...colorToApply.slice(rd + 1)];
  })
};

//Test suffle color
const startInterval = (client) => {
  param.interval = setInterval(async (client) => {
    console.log("end interval")
    await shuffleRoleColor(client)
  }, param.waitingTime, client);
};

const action = (interaction) => {
  const options = interaction.options;
    const subcommand = options.getSubcommand();
    const perso = PERSONALITY.getCommands().shuffle;

    if (subcommand === perso.startstop.name) {
      const ststPerso = perso.startstop;
      let newStatus;
      if (param.status === ststPerso.stop) {
        newStatus = ststPerso.status.start;
        param.status = newStatus;

        startInterval(interaction.client);
        interactionReply(interaction, ststPerso.started);
      } else if (param.status === ststPerso.start) {
        newStatus = ststPerso.status.stop;
        param.status = newStatus;

        clearInterval(param.interval);
        param.interval = null;
        interactionReply(interaction, ststPerso.stoped);
      }
    } else if (subcommand === perso.set.name) {
      const setPerso = perso.set;
      const newWaitingTime = options.getNumber(setPerso.numberOption.name);

      param.waitingTime = newWaitingTime;
      interactionReply(interaction, setPerso.changed);

      if (param.interval) {
        clearInterval(param.interval);
        startInterval(interaction.client);
      }
    }
};

const command = new SlashCommandBuilder()
    .setName(PERSONALITY.getCommands().shuffle.name)
    .setDescription(PERSONALITY.getCommands().shuffle.description)
    .setDefaultMemberPermissions(0x0000010000000000)
    .addSubcommand((subcommand) => 
        subcommand
            .setName(PERSONALITY.getCommands().shuffle.startstop.name)
            .setDescription(PERSONALITY.getCommands().shuffle.startstop.description)
    )
    .addSubcommand((subcommand) => 
        subcommand
            .setName(PERSONALITY.getCommands().shuffle.set.name)
            .setDescription(PERSONALITY.getCommands().shuffle.set.description)
            .addNumberOption((option) =>
                option
                    .setName(PERSONALITY.getCommands().shuffle.set.numberOption.name)
                    .setDescription(PERSONALITY.getCommands().shuffle.set.numberOption.description)
                    .setRequired(true)
            )
    );

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
};

export default shuffle;
