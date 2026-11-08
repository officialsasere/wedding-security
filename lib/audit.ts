import { add } from "./sheets"; import { uid, now } from "./util";
export const audit = (userId: string, action: string, entityType: string, entityId: string, description = "") => add("Audit", { id: uid("log"), userId, action, entityType, entityId, description, timestamp: now() });
