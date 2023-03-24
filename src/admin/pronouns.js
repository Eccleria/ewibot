// jsons imports
import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("static/commons.json"));

import { PERSONALITY } from "../personality.js";

export const pronounsButtonHandler = async (interaction) => {
  //get commons pronouns data
  const currentServer = commons.find(
    ({ guildId }) => guildId === interaction.guildId
  );
  const pronounsJson = Object.entries(currentServer.pronouns.pronouns);
  const agreementsJson = Object.entries(currentServer.pronouns.agreements);
  const rolesJson = [...pronounsJson, ...agreementsJson]; //[[button name, role id], []]
  console.log("interaction.customId.split('_')", interaction.customId)
  const json = rolesJson.find(
    (arr) => arr[0] === interaction.customId.split("_")[1]
  ); //get corresponding json duo

  //get triggering user data
  const guildMember = interaction.member; //get guildMember
  const roles = guildMember.roles; //get guildMember roles

  //get personality
  const personality = PERSONALITY.getCommands();
  const pronounsP = personality.pronouns;

  //handle roles
  if (json[1] !== "Annuler") {
    if (!roles.cache.has(json[1])) {
      guildMember.roles.add(json[1]); //if do not have, add role

      const content = pronounsP.text.replyAdd; //get reply message content
      interaction.reply({ content: content, ephemeral: true }); //reply to interaction
    } else {
      const content = pronounsP.text.replyAlreadyHave; //get reply message content
      interaction.reply({ content: content, ephemeral: true }); //reply to interaction
    }
  } else {
    //is cancel
    //get all roles to removes
    const jsonToUse = pronounsJson.includes(json)
      ? pronounsJson
      : agreementsJson;
    const toCheck = jsonToUse.filter((element) => element[1] !== "Annuler"); //remove cancels
    const toRemove = toCheck.reduce((acc, cur) => {
      return roles.cache.has(cur[1]) ? [...acc, cur[1]] : [...acc];
    }, []);

    if (toRemove.length !== 0) roles.remove(toRemove); //if have any, remove it/them

    const content = pronounsP.text.replyRemove; //get reply message content
    await interaction.reply({ content: content, ephemeral: true }); //reply to interaction
  }
};
