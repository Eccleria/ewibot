// jsons imports
import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("static/commons.json"));

import { PERSONALITY } from "../personality.js";

export const buttonHandler = async (interaction) => {
  //get commons pronouns data
  const currentServer = commons.find(
    ({ guildId }) => guildId === interaction.guildId
  );
  const pronounsJson = Object.entries(currentServer.pronouns.pronouns);
  const agreementsJson = Object.entries(currentServer.pronouns.agreements);
  const rolesJson = [...pronounsJson, ...agreementsJson]; //[[button name, role id], []]

  const json = rolesJson.find((arr) => arr[0] === interaction.customId); //get corresponding json duo

  //get triggering user data
  const guildMember = interaction.member; //get guildMember
  const roles = guildMember.roles; //get guildMember roles

  //handle roles
  if (json[1].length === 18 && !roles.cache.has(json[1]))
    guildMember.roles.add(json[1]);
  //if do not have, add role
  else {
    //is cancel
    //get all roles to removes
    const jsonToUse = pronounsJson.includes(json)
      ? pronounsJson
      : agreementsJson;
    const toCheck = jsonToUse.filter((element) => element[1].length === 18); //remove cancels
    const toRemove = toCheck.reduce((acc, cur) => {
      return roles.cache.has(cur[1]) ? [...acc, cur[1]] : [...acc];
    }, []);

    if (toRemove.length !== 0) roles.remove(toRemove);
  }

  //reply to interaction
  const personality = PERSONALITY.getCommands();
  const pronounsP = personality.pronouns;
  await interaction.reply({ content: pronounsP.text.reply, ephemeral: true });
};
