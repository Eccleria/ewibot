import { SlashCommandBuilder } from "@discordjs/builders";
import { interactionReply } from "../helpers/index.js";
import { COMMONS } from "../commons.js";
import { PERSONALITY } from "../personality.js";

export const shuffleParam = {
  status: PERSONALITY.getCommands().shuffle.startstop.stop,
  interval: null,
  waitingTime: 10 * 60 * 1000,
};

const colorList = [
  "#e74c3c",
  "#f1c40f",
  "#3498db",
  "#2ecc71",
  "#9b59b6",
  "#1abc9c",
]; //Orange, yellow, blue, green, purple, cyan

const shuffleRoleColor = async (client) => {
  const server =
    process.env.DEBUG === "yes" ? COMMONS.getTest() : COMMONS.getProd(); //get commons data

  const roles = Object.values(server.roles); // list of roles
  const guild = await client.guilds.fetch(server.guildId);

  let colorToApply = colorList;
  roles.forEach(async (roleData) => {
    const role = await guild.roles.fetch(roleData.roleId);
    const rd = Math.round((colorToApply.length - 1) * Math.random());
    role.setColor(colorToApply[rd]);
    colorToApply = [
      ...colorToApply.slice(0, rd),
      ...colorToApply.slice(rd + 1),
    ];
  });
};

const startInterval = (client) => {
  shuffleParam.interval = setInterval(
    async (client) => {
      await shuffleRoleColor(client);
    },
    shuffleParam.waitingTime,
    client,
  );
};

const action = async (interaction) => {
  const options = interaction.options;
  const client = interaction.client;
  const subcommand = options.getSubcommand();
  const perso = PERSONALITY.getCommands().shuffle;

  const server =
    process.env.DEBUG === "yes" ? COMMONS.getTest() : COMMONS.getProd(); //get commons data

  if (subcommand === perso.startstop.name) {
    //startstop
    const ststPerso = perso.startstop;
    let newStatus;
    if (shuffleParam.status === ststPerso.stop) {
      //start shuffle
      newStatus = ststPerso.start;
      shuffleParam.status = newStatus;

      startInterval(client);
      interactionReply(interaction, ststPerso.started);
    } else if (shuffleParam.status === ststPerso.start) {
      //stop shuffle
      newStatus = ststPerso.stop;

      //clear interval
      clearInterval(shuffleParam.interval);
      shuffleParam.interval = null;

      //reset colors
      const roles = Object.values(server.roles); // list of roles
      const guild = await client.guilds.fetch(server.guildId);
      roles.forEach(async (roleData) => {
        const role = await guild.roles.fetch(roleData.roleId);
        role.setColor(roleData.color);
      });

      setTimeout(() => {
        shuffleParam.status = newStatus; //reset param status after API update
      }, 10000);
      interactionReply(interaction, ststPerso.stoped);
    }
  } else if (subcommand === perso.set.name) {
    const setPerso = perso.set;
    const newWaitingTime = options.getNumber(setPerso.numberOption.name);

    shuffleParam.waitingTime = newWaitingTime;
    interactionReply(interaction, setPerso.changed);

    if (shuffleParam.interval) {
      clearInterval(shuffleParam.interval);
      startInterval(client);
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
      .setDescription(PERSONALITY.getCommands().shuffle.startstop.description),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName(PERSONALITY.getCommands().shuffle.set.name)
      .setDescription(PERSONALITY.getCommands().shuffle.set.description)
      .addNumberOption((option) =>
        option
          .setName(PERSONALITY.getCommands().shuffle.set.numberOption.name)
          .setDescription(
            PERSONALITY.getCommands().shuffle.set.numberOption.description,
          )
          .setRequired(true),
      ),
  );

const shuffle = {
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
