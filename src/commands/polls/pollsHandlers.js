import { MessageSelectMenu, MessageActionRow } from "discord.js";
import {
  sendSettingsButtons,
  disablePoll,
  removePollButtonAction,
  resetPollButtonAction,
  updatePollButtonAction,
  refreshPollButtonAction,
  //addChoicePollModal,
} from "./pollsSettings.js";
import { fetchPollMessage, interactionEditReply } from "./pollsUtils.js";
import { multipleVoteType } from "./pollsTypeMultiple.js";
import { uniqueVoteType } from "./pollsTypeUnique.js";
import { interactionReply } from "../utils.js";
import { getPoll, updatePollParam } from "../../helpers/index.js";
import { PERSONALITY } from "../../personality.js";
import { isPollEmptyVotes } from "../../helpers/db/dbPolls.js";

export const  pollsButtonHandler = async (interaction) => {
  // Dispatch button action to corresponding functions
  const { customId } = interaction;

  const sixNumber = Number(customId[6]);
  const voteButtonTest = !isNaN(sixNumber) && typeof sixNumber == "number";
  if (voteButtonTest) await voteButtonHandler(interaction);
};

export const voteButtonHandler = async (interaction) => {
  // dipatch vote according to voteType
  const { message, client } = interaction;

  //get personality
  const perso = PERSONALITY.getCommands().polls;
  const cPerso = perso.create;

  //get db data
  const db = client.db;
  const pollId = message.id;
  const dbPoll = getPoll(db, pollId); //get poll from db
  const { voteType } = dbPoll;

  if (voteType === cPerso.voteOption.choices[1].value) {
    //multiple
    multipleVoteType(interaction, dbPoll, perso, cPerso);
  } else if (voteType === cPerso.voteOption.choices[0].value) {
    //unique
    uniqueVoteType(interaction, dbPoll, perso, cPerso);
  } else interactionReply(interaction, perso.errorUnknownChoice);
};

export const settingsButtonHandler = async (interaction) => {
  // handle settings button
  const { customId } = interaction;
  if (customId.includes("settings")) sendSettingsButtons(interaction);
  else if (customId.includes("set_disable")) disablePoll(interaction);
  else if (customId.includes("set_remove")) removePollButtonAction(interaction);
  else if (customId.includes("set_reset")) resetPollButtonAction(interaction);
  else if (customId.includes("set_update")) updatePollButtonAction(interaction);
  else if (customId.includes("set_refresh")) refreshPollButtonAction(interaction);
};

/*
export const pollModalHandler = (interaction) => {
  // handle modals
  const { customId } = interaction;
  console.log("pollModalHandler");
  if (customId.includes("addChoice")) addChoicePollModal(interaction);
};
*/

export const pollSelectMenuHandler = async (interaction) => {
  const { customId } = interaction;

  const personality = PERSONALITY.getCommands().polls;
  if (customId.includes("_remove")) {
    console.log("interaction", interaction);

    interaction.deferReply({ ephemeral: true });
    const selected = interaction.values;
    console.log("values", selected);
  } else if (customId.includes("_update"))
    pollUpdateSelectMenuHandler(interaction);
  else
    return interactionReply(interaction, personality.errorSelectMenuNotFound);
};

const pollUpdateSelectMenuHandler = async (interaction) => {
  await interaction.deferUpdate({ ephemeral: true });
  const db = interaction.client.db;

  //handle interaction
  const selected = interaction.values;
  console.log("values", selected);

  const toChange = selected[0].split("update_")[1]; //get poll param to change
  console.log("toChange", toChange);

  //get personality
  const personality = PERSONALITY.getCommands().polls;
  if (toChange.includes("color")) {
    const perso = personality.settings.update.color;
    const persoColors = personality.create.colorOption.colors;

    if (toChange === "color") {
      // create selectMenu to chose wich poll param to change
      //create selectMenu
      const selectMenu = new MessageSelectMenu()
        .setCustomId(perso.customId)
        .setPlaceholder(perso.placeholder)
        .setMaxValues(1);

      //parse choices
      const baseValue = perso.baseValue;
      const choices = persoColors.choices.reduce((acc, cur) => {
        return [...acc, { label: cur.name, value: baseValue + cur.value }];
      }, []);
      selectMenu.addOptions(choices);

      //send message
      const actionRow = new MessageActionRow().addComponents(selectMenu);
      const payload = { components: [actionRow], ephemeral: true };
      interactionEditReply(interaction, payload);
    } else {
      // color is selected, apply change
      const color = toChange.split("_").slice(1).join("_"); //remove "color"
      const colorIdx = persoColors.choices.findIndex(
        (obj) => obj.value === color
      );

      //get embed
      const pollMessage = await fetchPollMessage(interaction);
      const embed = pollMessage.embeds[0];

      //update fields color
      const emoteColor = persoColors.progressBar[colorIdx];
      const black = personality.create.colorOption.black;
      const newFields = embed.fields.reduce((acc, cur) => {
        //get ratio
        const splited = cur.value.split(" ");
        const ratio = Number(splited[1].slice(0, -1));
        const nb = Math.floor(ratio / 10);

        //write new field
        const newValue =
          emoteColor.repeat(nb) +
          black.repeat(10 - nb) +
          splited.slice(1).join(" "); //new colorBar
        const field = { name: cur.name, value: newValue };
        return [...acc, field];
      }, []);

      //update embed
      embed.setColor(color); //change color
      embed.setFields(newFields); //change fields colorbar

      //send changes
      const editedPollMessage = { embeds: [embed] }; //update embed
      updatePollParam(db, pollMessage.id, "colorIdx", colorIdx);
      pollMessage.edit(editedPollMessage);
      interactionEditReply(interaction, {
        content: "La couleur a été changée.",
        components: [],
      });
    }
  } else if (toChange.includes("voteType")) {
    const perso = personality.settings.update.voteType;
    const voteTypePerso = personality.create.voteOption.choices;
    
    //get poll data
    const pollMessage = await fetchPollMessage(interaction);
    const dbPoll = getPoll(db, pollMessage.id);
    const oldVoteType = dbPoll.voteType;

    //check voteType
    const voteTypeTest = oldVoteType === voteTypePerso[1].name; //multiple
    if ( voteTypeTest && !isPollEmptyVotes(db, pollMessage.id)) {
      //multiple && is not empty
      const payload = { content: perso.errorShouldRAZBefore, components: [] };
      interactionEditReply(interaction, payload);
      return;
    }

    //embed footer
    const fPerso = personality.create.footer;
    const footerEnd = fPerso.options;
    let footerBegin;
    if (voteTypeTest) {
      //if old multiple, new unique
      footerBegin = fPerso.pollVoteType_unique;
      updatePollParam(db, pollMessage.id, "voteType", voteTypePerso[0].name); //voteType
      updatePollParam(db, pollMessage.id, "voteMax", 1); //set voteMax to 1
    } else {
      //if old unique, new multiple
      footerBegin = fPerso.pollVoteType_multiple + ` (${dbPoll.voteMax})`;
      updatePollParam(db, pollMessage.id, "voteType", voteTypePerso[1].name); //db
    }
    const embed = pollMessage.embeds[0];
    embed.setFooter({ text: footerBegin + footerEnd });

    //send
    pollMessage.edit({ embeds: [embed] });
    const payload = { content: perso.voteMaxChanged, components: [] };
    interactionEditReply(interaction, payload);
  } else if (toChange.includes("voteMax")) {
    const perso = personality.settings.update.voteMax;

    //get poll data
    const pollMessage = await fetchPollMessage(interaction);
    const dbPoll = getPoll(db, pollMessage.id);
    const oldVoteMax = dbPoll.voteMax;

    if (toChange === "voteMax") {
      //chose which is new voteMax value

      //create selectMenu
      const selectMenu = new MessageSelectMenu()
        .setCustomId(perso.customId)
        .setPlaceholder(perso.placeholder)
        .setMaxValues(1);

      //parse choices
      const baseValue = perso.baseValue;
      const choices = Array.from(new Array(10)).reduce((acc, _cur, idx) => {
        const voteNb = idx + 1;
        if (voteNb === oldVoteMax) return acc;
        const voteStr = voteNb.toString();
        return [...acc, { label: voteStr, value: baseValue + voteStr }];
      }, []);
      selectMenu.addOptions(choices);

      //send message
      const actionRow = new MessageActionRow().addComponents(selectMenu);
      const payload = { components: [actionRow], ephemeral: true };
      interactionEditReply(interaction, payload);
    } else {
      //change value
      //check voteType
      if (dbPoll.voteType === personality.create.voteOption.choices[0].name) {
        const payload = { content: perso.errorVoteUnique, components: [] };
        interactionEditReply(interaction, payload);
        return;
      }

      //get input value
      const maxVoteMax = dbPoll.votes.length;
      const newVoteMax = Number(toChange.split("_").slice(1)); //remove "voteMax"

      //compare
      if (newVoteMax > maxVoteMax) {
        // too many votes => return
        const payload = { content: perso.errorTooManyVotesMax, components: [] };
        interactionEditReply(interaction, payload);
        return;
      } else if (newVoteMax < oldVoteMax && !isPollEmptyVotes(db, pollMessage.id)) {
        // should RAZ first
        const payload = { content: perso.errorShouldRAZBefore, components: [] };
        interactionEditReply(interaction, payload);
        return;
      } else {
        // change

        updatePollParam(db, pollMessage.id, "voteMax", newVoteMax); //db

        //embed footer
        const fPerso = personality.create.footer;
        const newFooter =
          fPerso.pollVoteType_multiple + ` (${newVoteMax})` + fPerso.options;
        const embed = pollMessage.embeds[0];
        embed.setFooter({ text: newFooter });


        //send
        pollMessage.edit({ embeds: [embed] });
        const payload = { content: perso.voteMaxChanged, components: [] };
        interactionEditReply(interaction, payload);
      }
    }
  }
};
