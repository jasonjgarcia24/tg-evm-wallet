import dotenv from "dotenv";
dotenv.config();

import { telegram_bot as bot } from "../utils/telegram-bot";
import { SupportedNetworks } from "../config/network-config";
import { CallbackQuery } from "node-telegram-bot-api";
import { IProjectConfig } from "../config/types/project-types";

export const runPeanut = async (
    userWalletAddresses: Record<number, string>,
    activeNetwork: Record<number, SupportedNetworks>,
    projectConfig: Record<number, IProjectConfig>
): Promise<void> => {
    bot.on("callback_query", (query: CallbackQuery) => {
        if (!query.message) {
            console.log("QUERY_FAILED");
            return;
        }

        if (query.data === "peanut_exchange") {
            console.log(
                "userWalletAddress: ",
                userWalletAddresses[query.message.chat.id]
            );
            console.log(
                "activeNetwork: ",
                activeNetwork[query.message.chat.id]
            );

            console.log("do peanut stuff...");
        }
    });
};
