import dotenv from "dotenv";
dotenv.config();

import leaderboardApology from "./leadApo.js";
import pronouns from "./pronouns.js";

const commands =[
        leaderboardApology,
        pronouns,
      ];

export default commands; // Regroups all commands
