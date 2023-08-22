import { Callback } from "./types";

export const CALLBACKS: Record<Partial<Callback>, Partial<Callback>> = {
	GET_STARTED: "GET_STARTED",
	BROWSE_BASE: "BROWSE_BASE",
	BROWSE_OPT: "BROWSE_OPT",
	BROWSE_ZORA: "BROWSE_ZORA",
	TIMELINE_1h: "TIMELINE_1h",
	TIMELINE_6h: "TIMELINE_6h",
	TIMELINE_24h: "TIMELINE_24h",
};
