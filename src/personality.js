// jsons imports
import { readFileSync } from "fs";
const path = "static/personalities/";
const admin = JSON.parse(readFileSync(path + "admin.json"));
const announces = JSON.parse(readFileSync(path + "announces.json"));
const personalities = JSON.parse(readFileSync(path + "personalities.json"));
const colors = JSON.parse(readFileSync("static/colors.json"));



class Personality {
  constructor(name, personality, admin, announces, colors) {
    this.name = name;
    this.personality = personality;
    this.admin = admin;
    this.announces = announces;
    this.colors = colors;
  }

  setPersonality(name, personality) {
    this.name = name;
    this.personality = personality;
  }
  getPersonality() {
    return this.personality;
  }
  getName() {
    return this.name;
  }
  getCommands() {
    return this.personality.commands;
  }
  getSpotify() {
    return this.personality.spotify;
  }
  getAdmin() {
    return this.admin;
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
  personalities.normal,
  admin,
  announces,
  colors
);
