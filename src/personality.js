// jsons imports
import { readFileSync } from "fs";
const path = "static/personalities/";
const announces = JSON.parse(readFileSync(path + "announces.json"));
const normal = JSON.parse(readFileSync(path + "normal.json"));
const funny = JSON.parse(readFileSync(path + "funny.json"));
const colors = JSON.parse(readFileSync("static/colors.json"));

export class Personality {
  constructor(name, personality, announces, colors, personalities) {
    this.name = name;
    this.personality = personality;
    this.announces = announces;
    this.colors = colors;
    this.personalities = personalities;
  }

  setPersonality(name, personality) {
    this.name = name;
    this.personality = personality;
  }
  getPersonality() {
    return this.personality;
  }
  getPersonalities() {
    return this.personalities;
  }
  getName() {
    return this.name;
  }
  getAnnounces() {
    return this.announces;
  }
  getColors() {
    return this.colors;
  }
}

export const PERSONALITY = new Personality(
  "normal",
  normal.normal,
  announces,
  colors,
  [normal.name, funny.name],
);
