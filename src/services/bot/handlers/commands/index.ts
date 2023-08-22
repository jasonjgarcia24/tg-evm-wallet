import { CommandContext, Context, InlineKeyboard } from "grammy";
import { CALLBACKS } from "../../../../config/supported-commands";
import { UserService } from "../../../user";
import content from "./content.json";

export const startCommandHandler = async (
	ctx: CommandContext<Context>
): Promise<void> => {
	const tgUser = ctx.from;

	if (!tgUser || tgUser.is_bot) {
		ctx.reply(content.no_bot_message);
		return;
	}

	await UserService.createIfDoesntExist(tgUser);

	const inlineKeyboard = new InlineKeyboard().text(
		content.start_message_button,
		CALLBACKS.GET_STARTED
	);

	ctx.reply(content.start_message, { reply_markup: inlineKeyboard });
};
