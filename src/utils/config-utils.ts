import fs from "fs";
import { Message, InlineKeyboardButton } from "node-telegram-bot-api";
import { SupportedNetworks } from "../config/network-config";
import { ILoadConfig } from "../config/types/bot-types";
import { truncateAddress } from "./address-utils";
import {
    formatDisplayNetwork,
    chainIdToSupportedNetwork,
} from "../config/network-config";
import { setEthAddress } from "./account-utils";
import { setNetwork } from "./network-utils";
import { IProjectConfig } from "../config/types/project-types";

export const USER_CONFIG_PATH: string = "./src/config/user-configs.json";
export const PROJECT_CONFIG_PATH: string = "./src/config/project-configs.json";

export const loadUserConfigs = (
    msg: Message,
    userWalletAddress: Record<number, string>,
    activeNetwork: Record<number, SupportedNetworks>
): InlineKeyboardButton[][] => {
    // Read the configuration file.
    const user_configs: { [key: string]: ILoadConfig } = readUserConfigs();

    // Return the inline keyboard buttons for the user's accounts.
    const keyboardButtons: InlineKeyboardButton[][] = Object.keys(
        user_configs
    ).map((key, idx) => {
        if (idx === 0) {
            setEthAddress(
                msg,
                userWalletAddress,
                user_configs[key].walletAddress
            );
            // setNetwork(msg, activeNetwork, user_configs[key].network);
        }

        return [
            {
                text: `💰 ${truncateAddress(user_configs[key].walletAddress)}`,
                callback_data: `set_active_account_${user_configs[key].walletAddress}`,
            },
            {
                text: `🌐 ${formatDisplayNetwork(
                    user_configs[key].network as SupportedNetworks
                )}`,
                callback_data: `set_active_network_${user_configs[key].network}`,
            },
        ];
    });

    return keyboardButtons;
};

export const saveUserConfigs = (
    eoaAddress: string,
    walletAddress: string,
    chainId: number
) => {
    const network: string = chainIdToSupportedNetwork(chainId);

    // Read the configuration file.
    const user_configs = readUserConfigs();

    const jsonString = JSON.stringify({
        ...{
            [`${eoaAddress}_${network}`]: {
                eoaAddress: eoaAddress,
                network: network,
                walletAddress: walletAddress,
            },
        },
        ...user_configs,
    });

    fs.writeFileSync(USER_CONFIG_PATH, jsonString, "utf8");
};

function readUserConfigs(): any {
    const data = fs.readFileSync(USER_CONFIG_PATH, "utf8");
    return JSON.parse(data);
}

export const loadProjectConfigs = (
    msg: Message,
    userWalletAddress: Record<number, string>,
    activeNetwork: Record<number, SupportedNetworks>,
    projectConfig: Record<number, IProjectConfig>
) => {
    const walletAddress: string = userWalletAddress[msg.chat.id];
    const network = activeNetwork[msg.chat.id];

    // Read the configuration file.
    const project_configs: { [key: string]: any } = readProjectConfigs();

    // Get NFT addresses.
    const nftAddresses: string[] = Object.keys(project_configs[network].nfts);
    const nftTokenIds: string[] = Object.values(
        project_configs[network].nfts
    ).map((nft: any) => nft.tokenIds.map((tokenId: any) => tokenId.toString()));

    // Set project configs.
    const project_config: IProjectConfig = {
        network: network,
        mockMarketAddress: project_configs[network].mockMarketAddress,
        safeDelegateProxyAddress:
            project_configs[network].safeDelegateProxyAddress,
        gnosisSafeProxyAddress: project_configs[network].gnosisSafeProxyAddress,
        safeAddress: project_configs[network].safe[walletAddress].safeAddress,
        eoaOwnerAddress:
            project_configs[network].safe[walletAddress].eoaOwnerAddress,
        demoNftAddresses: nftAddresses,
        demoNftTokenIds: nftTokenIds,
    };

    projectConfig[msg.chat.id] = project_config;
};

function readProjectConfigs(): any {
    const data = fs.readFileSync(PROJECT_CONFIG_PATH, "utf8");
    return JSON.parse(data).networks;
}
