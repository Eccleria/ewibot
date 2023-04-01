# Slash commands

> For `polls`, please see (Polls Documentation)[./polls.md].

```javascript
const command = new SlashCommandBuilder()
  .setName("twitter")
  .setDescription("Commandes de gestions du lien Twitter-Discord.")
  .setDefaultMemberPermissions(0x0000000000000020) //MANAGE_GUILD bitwise
```