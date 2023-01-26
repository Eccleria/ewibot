import { createButton, interactionReply } from "../utils.js";
//import { PERSONALITY } from "../../personality.js";
import { MessageActionRow } from "discord.js";
import { PERSONALITY } from "../../personality.js";

export const settingsButtonHandler = async (interaction) => {
    // handle settings button
    /*const perso = PERSONALITY.getCommands().polls;
    interactionReply(interaction, perso.settings);
    */

    const { customId } = interaction;
    if (customId.includes("settings")) sendSettingsButtons(interaction);
    else if (customId.includes("set_disable")) disablePoll(interaction);
};

const sendSettingsButtons = (interaction) => {
    console.log("sendSettingsButtons")
    //get personality
    const perso = PERSONALITY.getCommands().polls.settings;

    //fetch embed
    const pollMessage = interaction.message;
    const pollEmbed = pollMessage.embeds[0];

    //create stop button
    const stopButton = createButton("polls_set_disable", "stop", "DANGER");
    if (pollEmbed.title.includes(perso.disable.title)) stopButton.setDisabled(true);
    
    //create ActionRows
    const actionRow = new MessageActionRow().addComponents(stopButton);

    //send buttons
    interaction.reply({components: [actionRow], ephemeral: true});
};

const disablePoll = async (interaction) => {
    console.log("disablePoll")
    
    //get personality
    const perso = PERSONALITY.getCommands().polls.settings;

    //fetch pollMessage
    const pollMessage = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
    const editedPollMessage = {};

    //edit title
    const pollEmbed = pollMessage.embeds[0];
    pollEmbed.title = pollEmbed.title + perso.disable.title;
    editedPollMessage.embeds = [pollEmbed];

    //edit poll buttons
    const components = pollMessage.components;
    const lastActionRow = components[components.length - 1];
    const settingButton = lastActionRow.components[lastActionRow.components.length - 1];
    const newActionRow = new MessageActionRow().addComponents(settingButton);
    editedPollMessage.components = [newActionRow];

    //edit poll message
    pollMessage.edit(editedPollMessage);
    interactionReply(interaction, perso.disable.disabled);
    /*console.log(interaction.message.components);
    const buttons = interaction.message.components.reduce((acc, cur) => [...acc, ...cur.components], []);
    console.log("buttons", buttons);
    const stopButton = buttons.find((button) => button.customId === "polls_set_disable");
    console.log("stopButton", stopButton);
    stopButton.setDisabled(true);
    const compLength = interaction.message.components.length;
    const newComponents = interaction.message.components;
    newComponents[compLength - 1].setComponents(newComponents[compLength - 1].slice(-1) + stopButton);*/
    .edit({components: []});
}
