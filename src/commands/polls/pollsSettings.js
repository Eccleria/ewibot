import { createButton, interactionReply } from "../utils.js";
//import { PERSONALITY } from "../../personality.js";
import { MessageActionRow } from "discord.js";

export const settingsButtonHandler = (interaction) => {
    // handle settings button
    /*const perso = PERSONALITY.getCommands().polls;
    interactionReply(interaction, perso.settings);
    */
    const { customId } = interaction;
    if (customId.includes("settings")) sendSettingsButtons(interaction);
    else if (customId.includes("set_disable")) disablePoll(interaction);
};

const sendSettingsButtons = (interaction) => {
    //create stop button
    const stopButton = createButton("polls_set_disable", "stop", "DANGER");
    const actionRow = new MessageActionRow().addComponents(stopButton);

    //send buttons
    interaction.reply({components: [actionRow], isEphemeral: true});
};

const disablePoll = async (interaction) => {
    console.log("interaction", interaction.message.reference);
    
    //fetch pollMessage
    const pollMessage = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
    const editedPollMessage = {};

    const pollEmbed = pollMessage.embeds[0];

    //edit title
    pollEmbed.title = pollEmbed.title + " - **Sondage Terminé**"
    editedPollMessage.embeds = [pollEmbed];

    //edit poll buttons
    const components = pollMessage.components;
    const lastActionRow = components[components.length - 1];
    const settingButton = lastActionRow.components[lastActionRow.components.length - 1];
    const newActionRow = new MessageActionRow().addComponents(settingButton);
    editedPollMessage.components = [newActionRow];

    //edit poll message
    pollMessage.edit(editedPollMessage);
    interactionReply(interaction, "Le sondage a bien été verrouillé.");
}