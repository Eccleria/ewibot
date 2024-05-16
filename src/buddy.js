import { COMMONS } from "./commons.js";

export const firstReactToAccountabilityMessage = (message) => {
    const commons = COMMONS.getShared();

    if (message.content.includes(":"))
        message.react(commons.accountabilityBuddyEmoteId);
};
