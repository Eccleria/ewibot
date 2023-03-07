import { getEventRoles } from "../../helpers/dbHelper.js";
import { interactionReply } from "../utils.js";
import { PERSONALITY } from "../../personality.js";

export const eventRolesButtonHandler = async (interaction) => {
  const { customId, guildId } = interaction;
  const personality = PERSONALITY.getCommands().eventRoles;
  const db = interaction.client.db;

  //get wanted role data
  const requestedEventRole = customId.split("_")[1];
  const currentEventServer = getEventRoles(db).find((obj) => obj.guildId === guildId);
  const eventRoleId = currentEventServer[requestedEventRole + "RoleId"];

  //give requested role
  const guildMember = interaction.member;
  if (!guildMember.roles.cache.has(eventRoleId)) {
    await guildMember.roles.add(eventRoleId);
    interactionReply(interaction, personality.role.added);
  } else {
    await guildMember.roles.remove(eventRoleId);
    interactionReply(interaction, personality.role.removed);
  }
}