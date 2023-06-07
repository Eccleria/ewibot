import { Client, Intents } from "discord.js";
import { action } from "../../src/commands/reverse.js";

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
  ],
});

client.on("test", console.log);

client.emit("test", "yo");

/*
test("reverse command action test", () => { 
    expect().toBe()
});*/
