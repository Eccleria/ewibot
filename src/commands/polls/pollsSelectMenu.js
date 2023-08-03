import { MessageActionRow, MessageSelectMenu } from "discord.js";
import {
  interactionEditReply,
  fetchPollMessage,
  refreshPollFields,
  pollRefreshEmbed,
} from "./pollsUtils.js";
import {
  getPoll,
  removePollChoice,
  updatePollButtonId,
  updatePollParam,
  isPollEmptyVotes,
} from "../../helpers/index.js";

import { PERSONALITY } from "../../personality.js";

export const pollSelectMenuHandler = async (interaction) => {
  const { customId } = interaction;

  const personality = PERSONALITY.getCommands().polls;
  await interaction.deferUpdate({ ephemeral: true });

  if (customId.includes("_remove")) {
    pollRemoveChoicesSelectMenuHandler(interaction);
  } else if (customId.includes("_update"))
    pollUpdateSelectMenuHandler(interaction);
  else
    return interactionEditReply(
      interaction,
      personality.errorSelectMenuNotFound
    );
};

const pollRemoveChoicesSelectMenuHandler = async (interaction) => {
  const selected = interaction.values; //get choices to remove
  const perso = PERSONALITY.getCommands().polls.settings.remove;

  //get data
  const pollMessage = await fetchPollMessage(interaction);
  const embed = pollMessage.embeds[0];

  //remove in db
  selected.forEach((buttonId) =>
    removePollChoice(interaction.client.db, pollMessage.id, buttonId)
  );

  //remove in embed
  const fields = embed.fields;
  const selectedIndexes = selected.map((str) => Number(str.split("_")[1])); //"polls_id"
  const filteredFields = fields.reduce((acc, cur, idx) => {
    if (selectedIndexes.includes(idx)) return acc; //to remove
    else return [...acc, cur];
  }, []);

  //update fields values/ratios
  const dbPoll = getPoll(interaction.client.db, pollMessage.id);
  const updatedFields = refreshPollFields(dbPoll, filteredFields);
  embed.setFields(updatedFields);

  //remove vote buttons
  const buttons = pollMessage.components.reduce(
    (acc, cur) => [...acc, ...cur.components],
    []
  );
  const filteredButtons = buttons.reduce((acc, cur, idx) => {
    if (selectedIndexes.includes(idx)) return acc;
    else return [...acc, cur];
  }, []);

  const newComponents = filteredButtons.reduce((acc, cur, idx) => {
    //update buttons ids + db value
    if (idx !== filteredButtons.length - 1) {
      //do not change polls_settings button
      const newId = "polls_" + idx.toString();
      updatePollButtonId(
        interaction.client.db,
        pollMessage.id,
        cur.customId,
        newId
      );
      cur.setCustomId(newId);
    }

    //handle MessageActionRows
    if (idx === 0 || acc[acc.length - 1].components.length === 5) {
      //if first or last AR is full
      const newAR = new MessageActionRow().addComponents(cur);
      return [...acc, newAR];
    } else {
      acc[acc.length - 1].addComponents(cur);
      return acc;
    }
  }, []);

  //update pollMessage
  const message = await pollMessage.edit({
    embeds: [embed],
    components: newComponents,
  });
  if (message)
    interactionEditReply(interaction, {
      content: perso.removed,
      components: [],
    });
  else
    interactionEditReply(interaction, {
      content: perso.errorNotUpdated,
      components: [],
    });
};

const pollUpdateSelectMenuHandler = async (interaction) => {
  const db = interaction.client.db;

  //handle interaction
  const selected = interaction.values;

  const toChange = selected[0].split("update_")[1]; //get poll param to change

  //get personality
  const personality = PERSONALITY.getCommands().polls;
  if (toChange === "anonymous") {
    //No need to select choice, apply modif

    //get embed
    const pollMessage = await fetchPollMessage(interaction);

    //update db
    const dbPoll = getPoll(db, pollMessage.id);
    const newAnonymous = !dbPoll.anonymous;
    updatePollParam(db, pollMessage.id, toChange, newAnonymous);

    //update embed
    await pollRefreshEmbed(pollMessage, dbPoll);

    interactionEditReply(interaction, {
      content: "Le paramètre anonyme a bien été changé.",
      components: [],
    });
  } else if (toChange.includes("color")) {
    const perso = personality.settings.update.color;
    const persoColors = PERSONALITY.getColors();

    if (toChange === "color") {
      // create selectMenu to chose which poll color to change
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
          ` ${splited.slice(1).join(" ")}`; //new colorBar
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
      const maxVoteMax = dbPoll.votes.length; //to delimit number of vote max
      const choices = Array.from(new Array(maxVoteMax)).reduce(
        (acc, _cur, idx) => {
          const voteNb = idx + 1;
          if (voteNb === oldVoteMax) return acc;
          const voteStr = voteNb.toString();
          return [...acc, { label: voteStr, value: baseValue + voteStr }];
        },
        []
      );
      selectMenu.addOptions(choices);

      //send message
      const actionRow = new MessageActionRow().addComponents(selectMenu);
      const payload = { components: [actionRow], ephemeral: true };
      interactionEditReply(interaction, payload);
    } else {
      //change value

      //get input value
      const maxVoteMax = dbPoll.votes.length;
      const newVoteMax = Number(toChange.split("_").slice(1)); //remove "voteMax"

      //compare
      if (newVoteMax > maxVoteMax) {
        //too many votes => return
        const payload = { content: perso.errorTooManyVotesMax, components: [] };
        interactionEditReply(interaction, payload);
        return;
      } else if (
        newVoteMax < oldVoteMax &&
        !isPollEmptyVotes(db, pollMessage.id)
      ) {
        //decreasing voteMax && not empty, should RAZ first
        const payload = { content: perso.errorShouldRAZBefore, components: [] };
        interactionEditReply(interaction, payload);
        return;
      } else {
        // change
        updatePollParam(db, pollMessage.id, "voteMax", newVoteMax); //db

        //embed footer
        const fPerso = personality.create.footer;
        const newFooter =
          newVoteMax !== 1
            ? fPerso.multiple + ` (${newVoteMax})`
            : fPerso.unique;
        const embed = pollMessage.embeds[0];
        embed.setFooter({ text: newFooter + fPerso.options });

        //send
        pollMessage.edit({ embeds: [embed] });
        const payload = { content: perso.voteMaxChanged, components: [] };
        interactionEditReply(interaction, payload);
      }
    }
  }
};
