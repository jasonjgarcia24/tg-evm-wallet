import dotenv from "dotenv";
dotenv.config();

import { ethers } from "ethers";
import { ContractReceipt } from "@ethersproject/contracts";
import { InlineKeyboardButton, Message } from "node-telegram-bot-api";
import {
    telegram_bot as bot,
    sendTelegramMessage,
} from "../utils/telegram-bot";
import { IProjectConfig } from "../config/types/project-types";
import {
    NFT_PURCHASE_GREETING,
    NFT_PURCHASE_INSTRUCTIONS,
    NFT_PURCHASE_EXAMPLE,
    QUERY_FAILED,
} from "../config/prompt-config";
import {
    SupportedNetworks,
    networkProvider,
    safeDelegatedProxyAddress,
    supportedNetworkToOpenseaAssetLink,
} from "../config/network-config";
import { validateEthAddress } from "../utils/account-utils";
import { truncateAddress } from "../utils/address-utils";
import {
    INVALID_TOKEN_ADDRESS,
    INVALID_TOKEN_ID,
} from "../config/prompt-config";
import {
    SAFE_DELEGATED_ERC721_PROXY_ABI,
    ERC721_ABI,
} from "../utils/contract-utils";
import { encodeSetAllowanceCalldata } from "../utils/proxy-utils";

const userInputState: Record<number, string> = {};
let messageId: number | undefined = undefined;

const CURRENT_PRICE_WEI = ethers.utils.parseEther("0.12345");

export const runNftPurchase = async (
    userWalletAddress: Record<number, string>,
    activeNetwork: Record<number, SupportedNetworks>,
    projectConfig: Record<number, IProjectConfig>
) => {
    bot.on("callback_query", async (query) => {
        if (!query.message) {
            console.log(QUERY_FAILED);
            return;
        }

        const chatId = query.message.chat.id;

        console.log("query.data: ", query.data);

        if (query.data === "direct_nft_buy") {
            await initNftPurchase(
                query.message,
                userWalletAddress,
                activeNetwork,
                projectConfig
            );
            userInputState[chatId] = "awaiting_token_serial_number";
        } else if (query.data!.startsWith("purchase_nft_")) {
            const [, , tokenAddress, tokenId] = query.data!.split("_");

            await executePurchaseNft(
                query.message,
                userWalletAddress,
                activeNetwork,
                tokenAddress,
                tokenId,
                CURRENT_PRICE_WEI
            );
        }
    });

    bot.on("message", async (msg: Message) => {
        const chatId = msg.chat.id;

        if (userInputState[chatId] === "awaiting_token_serial_number") {
            const confirmation = await confirmPurchaseNft(
                msg,
                userWalletAddress,
                activeNetwork
            );
            if (confirmation === null) return;

            const { tokenAddress, tokenId } = confirmation;
        }

        // Reset state
        userInputState[chatId] = "";
    });
};

const initNftPurchase = async (
    msg: Message,
    userWalletAddress: Record<number, string>,
    activeNetwork: Record<number, SupportedNetworks>,
    projectConfig: Record<number, IProjectConfig>
) => {
    await bot.sendMessage(msg.chat.id, NFT_PURCHASE_GREETING, {});

    await displayAvailableNfts(
        msg,
        userWalletAddress,
        activeNetwork,
        projectConfig
    );

    await bot.sendMessage(msg.chat.id, NFT_PURCHASE_INSTRUCTIONS, {});

    await bot.sendMessage(msg.chat.id, NFT_PURCHASE_EXAMPLE, {
        parse_mode: "HTML",
    });
};

const displayAvailableNfts = async (
    msg: Message,
    userWalletAddress: Record<number, string>,
    activeNetwork: Record<number, SupportedNetworks>,
    projectConfig: Record<number, IProjectConfig>
) => {
    const table: string = await renderNftListing(
        msg,
        userWalletAddress,
        activeNetwork,
        projectConfig
    );

    await bot.sendMessage(msg.chat.id, table, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
    });
};

const confirmPurchaseNft = async (
    msg: Message,
    userWalletAddress: Record<number, string>,
    activeNetwork: Record<number, SupportedNetworks>
): Promise<{ tokenAddress: string; tokenId: string } | null> => {
    const { tokenAddress, tokenId, isValidAddress, isValidTokenId } =
        parseNftPurchaseInput(msg.text!);

    if (!isValidAddress) {
        sendTelegramMessage(msg, INVALID_TOKEN_ADDRESS);
        return null;
    }
    if (!isValidTokenId) {
        sendTelegramMessage(msg, INVALID_TOKEN_ID);
        return null;
    }

    const nftPurchaseInputs: InlineKeyboardButton[][] =
        renderNftPurchaseOptions(tokenAddress, tokenId);

    await bot.sendMessage(msg.chat.id, "Proceed with purchase?", {
        reply_markup: {
            inline_keyboard: nftPurchaseInputs,
        },
    });

    return { tokenAddress, tokenId };
};

const executePurchaseNft = async (
    msg: Message,
    userWalletAddress: Record<number, string>,
    activeNetwork: Record<number, SupportedNetworks>,
    tokenAddress: string,
    tokenId: string,
    currentPrice: ethers.BigNumber
) => {
    const walletAddress = userWalletAddress[msg.chat.id];
    const network = activeNetwork[msg.chat.id];
    const provider = networkProvider(network)!;
    const wallet = new ethers.Wallet(
        process.env.PRIVATE_KEY_ACCOUNT_BOT!,
        provider
    );

    // const calldata = encodeSetAllowanceCalldata(
    //     tokenAddress,
    //     tokenId,
    //     currentPrice,
    //     walletAddress
    // );

    // console.log(calldata);

    // const safeTx: SafeTransaction = await createSafeTx(
    //     walletAddress,
    //     network,
    //     safeDelegatedProxyAddress(network)!,
    //     "0",
    //     calldata
    // );

    // console.log(safeTx);

    // let receipt: ContractReceipt | undefined = await approveTxHash(
    //     walletAddress,
    //     network,
    //     safeTx
    // );

    // console.log(receipt);

    // receipt = await signAndExecuteSafeTx(walletAddress, network, safeTx);

    // console.log(receipt);

    // const provider = networkProvider(network)!;
    // const contract = new ethers.Contract(
    //     safeDelegatedProxyAddress(network)!,
    //     SAFE_DELEGATED_ERC721_PROXY_ABI,
    //     provider
    // );
    // const allowanceKey = await contract.functions.generateAllowanceKey(
    //     userWalletAddress[msg.chat.id],
    //     "0xd774557b647330c91bf44cfeab205095f7e6c367",
    //     1,
    //     userWalletAddress[msg.chat.id]
    // );

    // console.log("allowanceKey: ", allowanceKey);
};

const getNftPayoff = async (
    network: SupportedNetworks,
    walletAddress: string,
    tokenAddress: string,
    tokenId: string
): Promise<ethers.BigNumber> => {
    const provider = networkProvider(network)!;

    const contract = new ethers.Contract(
        safeDelegatedProxyAddress(network)!,
        SAFE_DELEGATED_ERC721_PROXY_ABI,
        provider
    );

    console.log(walletAddress, tokenAddress, tokenId);

    const payoff: ethers.BigNumber =
        await contract.functions.getMaxAmountToPayForNFT(
            walletAddress,
            tokenAddress,
            tokenId
        );

    return payoff;
};

const renderNftListing = async (
    msg: Message,
    userWalletAddress: Record<number, string>,
    activeNetwork: Record<number, SupportedNetworks>,
    projectConfig: Record<number, IProjectConfig>
): Promise<string> => {
    const walletAddress = userWalletAddress[msg.chat.id];
    const network = activeNetwork[msg.chat.id];
    const project = projectConfig[msg.chat.id];

    const headers = [
        "Contract Address",
        " Token ID  ",
        "   Seller   ",
        "   Price    ",
        "Expiration Time",
        "Created Time",
    ];

    const div =
        "|------------------+-------------+--------------+--------------+-----------------+--------------";

    const currentPrice = ethers.utils.formatEther(CURRENT_PRICE_WEI);

    const options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "short",
        year: "numeric",
    };
    const expirationTime = new Date("31-Dec-2023").toLocaleDateString(
        "en-US",
        options
    );
    const createdTime = new Date("10-Aug-2023").toLocaleDateString(
        "en-US",
        options
    );

    const provider = networkProvider(network)!;

    let row: string = "";
    let link: string = "";
    const linsRecord: Record<string, string> = {};

    const nfts: (string | string[])[] = project.demoNftAddresses.map(
        (element, index) => [element, project.demoNftTokenIds[index]]
    );

    await Promise.all(
        nfts.map(async ([tokenAddress, tokenIds]) => {
            await Promise.all(
                (tokenIds as unknown as string[]).map(async (tokenId) => {
                    const contract = new ethers.Contract(
                        tokenAddress,
                        ERC721_ABI,
                        provider
                    );

                    const tokenOwner = await contract.ownerOf(tokenId);

                    if (
                        ethers.utils.getAddress(tokenOwner) ==
                        ethers.utils.getAddress(project.mockMarketAddress)
                    ) {
                        console.log(
                            await getNftPayoff(
                                network,
                                project.gnosisSafeProxyAddress,
                                tokenAddress,
                                tokenId
                            )
                        );

                        row +=
                            `| ${truncateAddress(tokenAddress)
                                .padStart(14, " ")
                                .padEnd(17, " ")}` +
                            `| ${tokenId.padEnd(12, " ")}` +
                            `| ${truncateAddress(walletAddress)} ` +
                            `| ${currentPrice.padEnd(12, "0")} ` +
                            `| ${expirationTime
                                .padStart(13, " ")
                                .padEnd(16, " ")}` +
                            `| ${createdTime} |\n`;

                        linsRecord[
                            tokenAddress
                        ] = `\n ${supportedNetworkToOpenseaAssetLink(
                            network,
                            tokenAddress,
                            tokenId
                        )}`;
                    }
                })
            );
        })
    );

    for (const tokenAddress in linsRecord) {
        link += linsRecord[tokenAddress];
    }

    const table = `<pre>| ${headers.join(
        " | "
    )} |\n${div}|\n${row}</pre>\n${link}`;

    console.log(table);

    return table;
};

const renderNftPurchaseOptions = (
    tokenAddress: string,
    tokenId: string
): InlineKeyboardButton[][] => {
    return [
        [
            {
                text: "Purchase",
                callback_data: `purchase_nft_${tokenAddress}_${tokenId}`,
            },
            { text: "Cancel", callback_data: "cancel_nft_purchase" },
        ],
    ];
};

const parseNftPurchaseInput = (
    input: string
): {
    tokenAddress: string;
    tokenId: string;
    isValidAddress: boolean;
    isValidTokenId: boolean;
} => {
    const [tokenAddress, tokenId] = input.split(",").map((x) => x.trim());

    return {
        tokenAddress: tokenAddress,
        tokenId: tokenId,
        isValidAddress: validateEthAddress(tokenAddress),
        isValidTokenId: Number.isInteger(Number(tokenId)),
    };
};
