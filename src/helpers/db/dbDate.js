import { dbReturnType } from "./dbStats.js";

const isDateSaved = (db, messageId) => {
	if(db.data.dateMessages.map((obj) => obj.messageId).includes(messageId))
		return dbReturnType.isIn;
	else return dbReturnType.isNotIn;
}

const addDate = (db, messageId, userId, channelId) => {
	if (isDateSaved(db, messageId) === dbReturnType.isIn) return;
	else {
		db.data.dateMessages = [...db.data.dateMessages, {
			messageId,
			channelId,
			userId
		}]
		return dbReturnType.isOk;
	}
}

export { isDateSaved, addDate };
