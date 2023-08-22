import dotenv from "dotenv";
dotenv.config();

import TelegramBot from "node-telegram-bot-api";

const BOT_TOKEN = process.env.TG_BOT_TOKEN as string;

interface ITelegramMessage {
    chat: { id: number };
}

export const telegram_bot = new TelegramBot(BOT_TOKEN, { polling: true });

export const sendTelegramMessage = (
    msg: ITelegramMessage,
    text: string,
    opts?: object
) => {
    if (!!opts) {
        telegram_bot.sendMessage(msg.chat.id, text, opts);
    } else {
        telegram_bot.sendMessage(msg.chat.id, text);
    }
};
