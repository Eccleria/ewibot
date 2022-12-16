import dotenv from "dotenv";
dotenv.config();

import reminder from "./reminder.js";
import spotify from "./spotify.js";
import leaderboardApology from "./leadApo.js";
import pronouns from "./pronouns.js";

const commands =
  process.env.USE_SPOTIFY === "yes"
    ? [
        leaderboardApology,
        pronouns,
        reminder,
        spotify,
      ]
    : [
        leaderboardApology,
        pronouns,
        reminder,
      ];

export default commands; // Regroups all commands
