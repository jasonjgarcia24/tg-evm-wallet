import {
    Message,
    CallbackQuery,
    InlineKeyboardButton,
} from "node-telegram-bot-api";
import { telegram_bot as bot } from "../utils/telegram-bot";
import { IProjectConfig } from "../config/types/project-types";
import { QUERY_FAILED } from "../config/prompt-config";
import {
    SupportedNetworks,
    formatDisplayNetwork,
} from "../config/network-config";
import { SupportedTrendingPeriods } from "../config/trending-config";

let messageId: number | undefined = undefined;
const nftProfileTrendingPeriod: Record<number, string> = {};

export const runNFTs = (
    activeNetwork: Record<number, SupportedNetworks>,
    selectedTrendingPeriod: Record<number, SupportedTrendingPeriods>,
    projectConfig: Record<number, IProjectConfig>
) => {
    bot.on("callback_query", (query: CallbackQuery) => {
        if (!query.message) {
            console.log(QUERY_FAILED);
            return;
        }

        if (query.data === "nft_profile") {
            initNftProfile(query.message);
        } else if (query.data!.startsWith("nft_network_select_")) {
            updateNftProfileNetwork(
                query,
                activeNetwork,
                selectedTrendingPeriod
            );
        } else if (query.data!.startsWith("nft_trending_period_select_")) {
            updateNftProfileTrendingPeriod(
                query,
                activeNetwork,
                selectedTrendingPeriod
            );
        }
    });
};

const initNftProfile = (msg: Message) => {
    bot.sendMessage(msg.chat.id, "Select network and trending period:", {
        reply_markup: {
            inline_keyboard: renderNftInlineKeyboard({}),
        },
    }).then((msg: Message) => {
        messageId = msg.message_id;
    });
};

const updateNftProfileNetwork = (
    query: CallbackQuery,
    activeNetwork: Record<number, SupportedNetworks>,
    selectedTrendingPeriod: Record<number, SupportedTrendingPeriods>
) => {
    if (query.message === undefined || query.data === undefined) {
        console.log(QUERY_FAILED);
        return;
    }

    // Get the selected network.
    const query_data_bits = query.data.split("_");
    const selected_network = query_data_bits
        .slice(-2)
        .join("_") as SupportedNetworks;

    // Update the active network.
    const chatId = query.message.chat.id;
    const selected_trending_period = selectedTrendingPeriod[chatId];
    activeNetwork[chatId] = selected_network;

    bot.editMessageReplyMarkup(
        {
            inline_keyboard: renderNftInlineKeyboard({
                selected_network: selected_network,
                selected_trending_period: selected_trending_period,
            }),
        },
        {
            chat_id: chatId,
            message_id: messageId,
        }
    );
};

const updateNftProfileTrendingPeriod = (
    query: CallbackQuery,
    activeNetwork: Record<number, SupportedNetworks>,
    selectedTrendingPeriod: Record<number, SupportedTrendingPeriods>
) => {
    if (query.message === undefined || query.data === undefined) {
        console.log(QUERY_FAILED);
        return;
    }

    // Get the selected trending period.
    const query_data_bits = query.data.split("_");
    const selected_trending_period = query_data_bits[
        query_data_bits.length - 1
    ] as SupportedTrendingPeriods;

    // Update the active trending period.
    const chatId = query.message.chat.id;
    const selected_network = activeNetwork[chatId] as SupportedNetworks;
    selectedTrendingPeriod[chatId] = selected_trending_period;

    bot.editMessageReplyMarkup(
        {
            inline_keyboard: renderNftInlineKeyboard({
                selected_network: selected_network,
                selected_trending_period: selected_trending_period,
            }),
        },
        {
            chat_id: chatId,
            message_id: messageId,
        }
    );
};

const renderNftInlineKeyboard = ({
    selected_network = SupportedNetworks.UNDEFINED,
    selected_trending_period = SupportedTrendingPeriods.UNDEFINED,
}: {
    selected_network?: SupportedNetworks;
    selected_trending_period?: SupportedTrendingPeriods;
}): InlineKeyboardButton[][] => {
    return [
        [
            keyboardNetworkButton(
                SupportedNetworks.ETHEREUM_MAINNET,
                selected_network
            ),
            keyboardNetworkButton(
                SupportedNetworks.ETHEREUM_SEPOLIA,
                selected_network
            ),
        ],
        [
            keyboardNetworkButton(
                SupportedNetworks.OPTIMISM_MAINNET,
                selected_network
            ),
            keyboardNetworkButton(
                SupportedNetworks.OPTIMISM_GOERLI,
                selected_network
            ),
        ],
        [
            keyboardNetworkButton(
                SupportedNetworks.BASE_MAINNET,
                selected_network
            ),
            keyboardNetworkButton(
                SupportedNetworks.BASE_GOERLI,
                selected_network
            ),
        ],
        [
            keyboardNetworkButton(
                SupportedNetworks.ZORA_MAINNET,
                selected_network
            ),
            keyboardNetworkButton(
                SupportedNetworks.ZORA_GOERLI,
                selected_network
            ),
        ],
        [
            // keyboardTrendingPeriodButton(
            //     SupportedTrendingPeriods._1HR,
            //     selected_trending_period
            // ),
            keyboardTrendingPeriodButton(
                SupportedTrendingPeriods._6HR,
                selected_trending_period
            ),
            // ],
            // [
            keyboardTrendingPeriodButton(
                SupportedTrendingPeriods._24HR,
                selected_trending_period
            ),
            keyboardTrendingPeriodButton(
                SupportedTrendingPeriods._1WK,
                selected_trending_period
            ),
        ],
        [keyboardNftTrendingButton(selected_network, selected_trending_period)],
    ];
};

function keyboardNetworkButton(
    network: SupportedNetworks,
    selected_network: SupportedNetworks
): InlineKeyboardButton {
    const formattedNetwork: string = formatDisplayNetwork(network);

    return {
        text:
            network === selected_network
                ? `💚  ${formattedNetwork}`
                : formattedNetwork,
        callback_data: `nft_network_select_${network}`,
    };
}

function keyboardTrendingPeriodButton(
    trending_period: SupportedTrendingPeriods,
    selected_trending_period: SupportedTrendingPeriods
): InlineKeyboardButton {
    return {
        text:
            trending_period === selected_trending_period
                ? `💚  ${trending_period}  Trending NFTs`
                : `${trending_period}  Trending NFTs`,
        callback_data: `nft_trending_period_select_${trending_period}`,
    };
}

function keyboardNftTrendingButton(
    selected_network: SupportedNetworks,
    selected_trending_period: SupportedTrendingPeriods
): InlineKeyboardButton {
    return selected_network === SupportedNetworks.UNDEFINED ||
        selected_trending_period === SupportedTrendingPeriods.UNDEFINED
        ? {
              text: "🔥 Select Network and Trending Period  🔥",
              callback_data: "NONE",
          }
        : {
              text: "🔥  Discover Trending NFTs  🔥",
              callback_data: "trending_profile",
          };
}
