import { CallbackQueryContext, CommandContext, Context } from "grammy";
import { Callback, Command } from "../../../config/types";
import {
	handleBrowseBase,
	handleBrowseOpt,
	handleBrowseZora,
	handleTimeline1h,
	handleTimeline24h,
	handleTimeline6h,
	startCallbackHandler,
} from "./callbacks";
import { startCommandHandler } from "./commands";

type BotConfig = {
	messageHandler: (ctx: Context) => Promise<void>;
	commandHandlers: Record<
		Command,
		(ctx: CommandContext<Context>) => Promise<void>
	>;
	callbackHandlers: Record<
		Callback,
		(ctx: CallbackQueryContext<Context>) => Promise<void>
	>;
};

const botConfig: BotConfig = {
	messageHandler: async (ctx) => {
		console.log("--type", ctx.chat?.type);
	},
	commandHandlers: {
		start: startCommandHandler,
	},
	callbackHandlers: {
		GET_STARTED: startCallbackHandler,
		BROWSE_BASE: handleBrowseBase,
		BROWSE_ZORA: handleBrowseZora,
		BROWSE_OPT: handleBrowseOpt,
		TIMELINE_1h: handleTimeline1h,
		TIMELINE_6h: handleTimeline6h,
		TIMELINE_24h: handleTimeline24h,
	},
};

export default botConfig;
