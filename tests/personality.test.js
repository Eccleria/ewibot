import { describe, expect, test } from "@jest/globals";

import { Personality, PERSONALITY } from "../src/personality.js";

describe("Personality", () => {
  test("Singleton exists", () => {
    expect(PERSONALITY).toBeDefined();
    expect(PERSONALITY).toBeInstanceOf(Personality);
  });

  const personalities = ["nom", "fun"];
  const perso = {commands: "commande", spotify: "spotify"}
  const p = new Personality("nom", "personalité", "annonces", "couleurs", personalities);

  test("Correct init", () => {
    expect(p.name).toBe("nom");
    expect(p.personality).toBe("personalité");
    expect(p.announces).toBe("annonces");
    expect(p.colors).toBe("couleurs");
    expect(p.personalities).toStrictEqual(personalities);
  });

  test("setPersonality", () => {
    p.setPersonality("fun", perso);
    expect(p.name).toBe("fun");
    expect(p.personality).toStrictEqual(perso);
  });

  test("getPersonnality", () => {
    expect(p.getPersonality()).toStrictEqual(perso);
  });

  test("getPersonnalities", () => {
    expect(p.getPersonalities()).toContain("nom");
    expect(p.getPersonalities()).toContain("fun");
  });

  test("getName", () => {
    expect(p.getName()).toBe("fun");
  });

  test("getAnnounces", () => {
    expect(p.getAnnounces()).toBe("annonces");
  });

  test("getColors", () => {
    expect(p.getColors()).toBe("couleurs");
  });
});
