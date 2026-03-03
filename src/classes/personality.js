// jsons imports
import { readFileSync } from "fs";
const path = "static/personalities/";
const announces = JSON.parse(readFileSync(path + "announces.json"));
const normal = JSON.parse(readFileSync(path + "normal.json"));
const funny = JSON.parse(readFileSync(path + "funny.json"));
const colors = JSON.parse(readFileSync("static/colors.json"));

class Personality {
  constructor(name, personality, announces, colors, personalities) {
    this._name = name;
    this._personality = personality;
    this._announces = announces;
    this._colors = colors;
    this._personalities = personalities;
  }

  setPersonality(name, personality) {
    this._name = name;
    this._personality = personality;
  }
  getPersonality() {
    return this._personality;
  }
  getPersonalities() {
    return this._personalities;
  }
  getName() {
    return this._name;
  }
  getAnnounces() {
    return this._announces;
  }
  getColors() {
    return this._colors;
  }
}

export const PERSONALITY = new Personality(
  "normal",
  normal.normal,
  announces,
  colors,
  [normal.name, funny.name],
);
