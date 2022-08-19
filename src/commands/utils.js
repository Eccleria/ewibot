/**
 * Reply to interaction function
 * @param {any} interaction Interaction the function is replying to.
 * @param {string} content Content of the replying message.
 * @param {boolean} [isEphemeral] Send *ephemeral or not* message, true by default.
 */
export const interactionReply = async (interaction, content, isEphemeral = true) => {
  await interaction.reply({ content: content, ephemeral: isEphemeral });
}
