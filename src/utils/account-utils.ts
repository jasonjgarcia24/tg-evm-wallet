import { ethers } from "ethers";
import { Message } from "node-telegram-bot-api";
import { sendTelegramMessage } from "./telegram-bot";

import { SupportedNetworks } from "../config/network-config";
import { getProvider } from "./network-utils";
import { INVALID_ETH_ADDRESS } from "../config/prompt-config";

export const validateEthAddress = (address: string | null): boolean => {
    return (
        address !== null &&
        address !== undefined &&
        ethers.utils.isAddress(address)
    );
};

const invalidEthAddressResponse = (msg: Message) => {
    sendTelegramMessage(msg, INVALID_ETH_ADDRESS);
};

export const setEthAddress = (
    msg: Message,
    addressesRecord: Record<number, string>,
    address: string
) => {
    const chatId = msg.chat.id;
    addressesRecord[chatId] = ethers.utils.getAddress(address);
};

export const getEthAddress = (
    msg: Message,
    addressesRecord: Record<number, string>,
    { strict = false }: { strict?: boolean } = {}
): string | null => {
    const chatId = msg.chat.id;
    if (validateEthAddress(addressesRecord[chatId]) === false) {
        if (strict) invalidEthAddressResponse(msg);
        return null;
    } else {
        return addressesRecord[chatId];
    }
};

export const getEthBalance = async (
    msg: Message,
    addressesRecord: Record<number, string>
): Promise<string | null | undefined> => {
    const address = getEthAddress(msg, addressesRecord);
    if (validateEthAddress(address) === false) {
        return null;
    } else {
        // Get the provider for the network.
        const provider: ethers.providers.JsonRpcProvider | null = getProvider(
            SupportedNetworks.ETHEREUM_SEPOLIA
        );

        // Verify the provider was retrieved.
        if (provider === null) {
            return undefined;
        }

        // Get the balance of the address.
        const balance = await provider.getBalance(address as string);

        return ethers.utils.formatEther(balance);
    }
};
