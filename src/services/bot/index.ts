import { Bot, CallbackQueryContext, CommandContext, Context } from "grammy";

import { Callback, Command } from "../../config/types";
import botConfig from "./handlers";

export class IntgrBot {
	bot: Bot;

	constructor() {
		const BOT_TOKEN = process.env["BOT_TOKEN"];

		if (!BOT_TOKEN) {
			throw Error("BOT_CONN_ERR: Bot token not provided");
		}

		this.bot = new Bot(BOT_TOKEN);
	}

	private callbackWrapper(
		ctx: CallbackQueryContext<Context>,
		fn: (ctx: CallbackQueryContext<Context>) => void
	) {
		console.log(
			`--handling command ${ctx.callbackQuery.data} from ${ctx.from?.username}`
		);

		ctx.replyWithChatAction("typing");

		fn(ctx);
	}

	private commandWrapper(
		ctx: CommandContext<Context>,
		fn: (ctx: CommandContext<Context>) => void
	) {
		console.log(
			`--handling command ${ctx.msg.text} from ${ctx.from?.username}`
		);

		ctx.replyWithChatAction("typing");

		fn(ctx);
	}

	setup() {
		Object.keys(botConfig.callbackHandlers).forEach((trigger) => {
			this.bot.callbackQuery(trigger, (ctx) =>
				this.callbackWrapper(
					ctx,
					botConfig.callbackHandlers[trigger as Callback]
				)
			);
		});

		Object.keys(botConfig.commandHandlers).forEach((trigger) => {
			this.bot.command(trigger, (ctx) =>
				this.commandWrapper(ctx, botConfig.commandHandlers[trigger as Command])
			);
		});

		this.bot.on("message", botConfig.messageHandler);
	}

	run() {
		this.bot.start();

		console.log("Bot Started!");
	}
}
