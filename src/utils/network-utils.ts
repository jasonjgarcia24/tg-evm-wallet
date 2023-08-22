import dotenv from "dotenv";
dotenv.config();

import { ethers } from "ethers";
import { Message } from "node-telegram-bot-api";
import { SupportedNetworks } from "../config/network-config";

export const getProvider = (
    network: SupportedNetworks
): ethers.providers.JsonRpcProvider | null => {
    const rpc_url = process.env[network.toUpperCase() + "_RPC_URL"];
    if (rpc_url === undefined) {
        return null;
    }

    const provider = new ethers.providers.JsonRpcProvider(rpc_url);

    return provider;
};

export const setNetwork = (
    msg: Message,
    activeNetwork: Record<number, string | undefined>,
    network: string
) => {
    const chatId = msg.chat.id;
    activeNetwork[chatId] = network;
};

export const isSupportedNetwork = (network: string): boolean => {
    return Object.values(SupportedNetworks).includes(
        network as SupportedNetworks
    );
};

export const getNetwork = (
    msg: Message,
    activeNetwork: Record<number, string | undefined>
): string | null => {
    const chatId = msg.chat.id;
    const network: string | undefined = activeNetwork[chatId];

    return network !== undefined ? network : null;
};
