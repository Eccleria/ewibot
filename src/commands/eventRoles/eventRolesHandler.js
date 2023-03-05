import { PERSONALITY } from "../../personality.js";
import { interactionReply } from "../utils.js";
import { EVENTCOMMONS } from "./eventCommons.js";

export const eventRolesButtonHandler = async (interaction) => {
  const { customId, guildId } = interaction;
  const personality = PERSONALITY.getCommands().eventRoles;

  //get wanted role data
  const requestedEventRole = customId.split("_")[1];
  const currentEventServer = EVENTCOMMONS.getCommons().find((obj) => obj.guildId === guildId);
  const eventRoleId = currentEventServer[requestedEventRole + "RoleId"];

  //give requested role
  const guildMember = interaction.member;
  await guildMember.roles.add(eventRoleId);
  interactionReply(interaction, personality.role.added);
}