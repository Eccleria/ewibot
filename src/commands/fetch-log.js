import { SlashCommandBuilder } from "@discordjs/builders";
import { interactionReply } from "../helpers/index.js";
import { COMMONS } from "../commons.js";
import { PERSONALITY } from "../personality.js";
import { fetchAuditLog } from "../admin/utils.js";
import { AuditLogEvent } from "discord.js";

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getCommands().fetchLog.name)
  .setDescription(PERSONALITY.getCommands().fetchLog.description)
  .setDefaultMemberPermissions(0x0000010000000000);

const action = async (interaction) => {
  const logs = await interaction.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.MessageDelete,
  }); //fetch logs
  console.log(logs);
  console.log(logs.entries.first());
  console.log(logs.entries.first().target);
  console.log(logs.entries.first().executor);
  console.log(logs.entries.first().extra);
};


const fetchLog = {
  command: command,
  action,
  help: (interaction) => {
    const content = PERSONALITY.getCommands().fetchLog.help;
    interactionReply(interaction, content);
  },
  admin: true,
  releaseDate: null, //dayjs("01-01-2023", "MM-DD-YYYY"),
  sentinelle: false,
};

export default fetchLog;
