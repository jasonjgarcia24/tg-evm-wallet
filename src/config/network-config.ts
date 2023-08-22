import dotenv from "dotenv";
dotenv.config();

import { ethers } from "ethers";
import { INetworkUrls } from "./types/network-types";
import { ZDKChain, ZDKNetwork } from "@zoralabs/zdk";
import { NetworkInfo } from "@zoralabs/zdk/dist/queries/queries-sdk";

export enum SupportedNetworks {
    ETHEREUM_MAINNET = "ethereum_mainnet",
    ETHEREUM_SEPOLIA = "ethereum_sepolia",
    ETHERUM_GOERLI = "ethereum_goerli",
    OPTIMISM_MAINNET = "optimism_mainnet",
    OPTIMISM_GOERLI = "optimism_goerli",
    BASE_MAINNET = "base_mainnet",
    BASE_GOERLI = "base_goerli",
    ZORA_MAINNET = "zora_mainnet",
    ZORA_GOERLI = "zora_goerli",
    LOCALHOST = "localhost",
    UNDEFINED = "_undefined_",
}

export const network_urls: INetworkUrls = {
    ETHEREUM_MAINNET: process.env.ETHEREUM_MAINNET_RPC_URL as string,
    ETHEREUM_SEPOLIA: process.env.ETHEREUM_SEPOLIA_RPC_URL as string,
    ETHEREUM_GOERLI: process.env.ETHEREUM_GOERLI_RPC_URL as string,
    OPTIMISM_MAINNET: process.env.OPTIMISM_MAINNET_RPC_URL as string,
    OPTIMISM_GOERLI: process.env.OPTIMISM_GOERLI_RPC_URL as string,
    BASE_MAINNET: process.env.BASE_MAINNET_RPC_URL as string,
    BASE_GOERLI: process.env.BASE_GOERLI_RPC_URL as string,
    ZORA_MAINNET: process.env.ZORA_MAINNET_RPC_URL as string,
    ZORA_GOERLI: process.env.ZORA_GOERLI_RPC_URL as string,
    LOCALHOST: "http://localhost:8545",
};

export const networkProvider = (
    network: string
): ethers.providers.JsonRpcProvider | null => {
    let provider: ethers.providers.JsonRpcProvider | null = null;

    switch (network) {
        case SupportedNetworks.ETHEREUM_MAINNET:
            provider = new ethers.providers.JsonRpcProvider(
                network_urls.ETHEREUM_MAINNET
            );
            return provider;
        case SupportedNetworks.ETHEREUM_SEPOLIA:
            provider = new ethers.providers.JsonRpcProvider(
                network_urls.ETHEREUM_SEPOLIA
            );
            return provider;
        case SupportedNetworks.ETHERUM_GOERLI:
            provider = new ethers.providers.JsonRpcProvider(
                network_urls.ETHEREUM_GOERLI
            );
            return provider;
        case SupportedNetworks.OPTIMISM_MAINNET:
            provider = new ethers.providers.JsonRpcProvider(
                network_urls.OPTIMISM_MAINNET
            );
            return provider;
        case SupportedNetworks.OPTIMISM_GOERLI:
            provider = new ethers.providers.JsonRpcProvider(
                network_urls.OPTIMISM_GOERLI
            );
            return provider;
        case SupportedNetworks.BASE_MAINNET:
            provider = new ethers.providers.JsonRpcProvider(
                network_urls.BASE_MAINNET
            );
            return provider;
        case SupportedNetworks.BASE_GOERLI:
            provider = new ethers.providers.JsonRpcProvider(
                network_urls.BASE_GOERLI
            );
            return provider;
        case SupportedNetworks.ZORA_MAINNET:
            provider = new ethers.providers.JsonRpcProvider(
                network_urls.ZORA_MAINNET
            );
            return provider;
        case SupportedNetworks.ZORA_GOERLI:
            provider = new ethers.providers.JsonRpcProvider(
                network_urls.ZORA_GOERLI
            );
            return provider;
        default:
            return provider;
    }
};

const explorer_urls = {
    ETHEREUM_MAINNET: "https://etherscan.io/",
    ETHEREUM_SEPOLIA: "https://sepolia.etherscan.io/",
    ETHEREUM_GOERLI: "https://goerli.etherscan.io/",
    OPTIMISM_MAINNET: "https://optimistic.etherscan.io/",
    OPTIMISM_GOERLI: "https://goerli-optimism.etherscan.io/",
    BASE_MAINNET: "https://base.blockscout.com/",
    BASE_GOERLI: "https://eth-goerli.blockscout.com/",
    ZORA_MAINNET: "https://explorer.zora.energy",
    ZORA_GOERLI: "",
    LOCALHOST: "",
};

export const networkUrl = (
    network: string,
    fallback: boolean = true
): string => {
    switch (network) {
        case SupportedNetworks.ETHEREUM_MAINNET:
            return network_urls.ETHEREUM_MAINNET;
        case SupportedNetworks.ETHEREUM_SEPOLIA:
            return network_urls.ETHEREUM_SEPOLIA;
        case SupportedNetworks.ETHERUM_GOERLI:
            return network_urls.ETHEREUM_GOERLI;
        case SupportedNetworks.OPTIMISM_MAINNET:
            return network_urls.OPTIMISM_MAINNET;
        case SupportedNetworks.OPTIMISM_GOERLI:
            return network_urls.OPTIMISM_GOERLI;
        case SupportedNetworks.BASE_MAINNET:
            return network_urls.BASE_MAINNET;
        case SupportedNetworks.BASE_GOERLI:
            return network_urls.BASE_GOERLI;
        case SupportedNetworks.ZORA_MAINNET:
            return network_urls.ZORA_MAINNET;
        case SupportedNetworks.ZORA_GOERLI:
            return network_urls.ZORA_GOERLI;
        default:
            return fallback ? network_urls.LOCALHOST : "";
    }
};

export const safeDelegatedProxyAddress = (
    network: string | null
): string | null | undefined => {
    switch (network) {
        case SupportedNetworks.ETHEREUM_MAINNET:
            return process.env.ETHEREUM_MAINNET_SAFE_DEL_PROXY_ADDRESS;
        case SupportedNetworks.ETHEREUM_SEPOLIA:
            return process.env.ETHEREUM_SEPOLIA_SAFE_DEL_PROXY_ADDRESS;
        case SupportedNetworks.ETHERUM_GOERLI:
            return process.env.ETHEREUM_GOERLI_SAFE_DEL_PROXY_ADDRESS;
        case SupportedNetworks.OPTIMISM_MAINNET:
            return process.env.OPTIMISM_MAINNET_SAFE_DEL_PROXY_ADDRESS;
        case SupportedNetworks.OPTIMISM_GOERLI:
            return process.env.OPTIMISM_GOERLI_SAFE_DEL_PROXY_ADDRESS;
        case SupportedNetworks.BASE_MAINNET:
            return process.env.BASE_MAINNET_SAFE_DEL_PROXY_ADDRESS;
        case SupportedNetworks.BASE_GOERLI:
            return process.env.BASE_GOERLI_SAFE_DEL_PROXY_ADDRESS;
        case SupportedNetworks.ZORA_MAINNET:
            return process.env.ZORA_MAINNET_SAFE_DEL_PROXY_ADDRESS;
        case SupportedNetworks.ZORA_GOERLI:
            return process.env.ZORA_GOERLI_SAFE_DEL_PROXY_ADDRESS;
        default:
            return null;
    }
};

export const addressExplorerUrl = (
    network: string | null,
    address: string,
    fallback: boolean = true
): string => {
    switch (network) {
        case SupportedNetworks.ETHEREUM_MAINNET:
            return `<a href="${explorer_urls.ETHEREUM_MAINNET}/address/${address}">${address}</a>`;
        case SupportedNetworks.ETHEREUM_SEPOLIA:
            return `<a href="${explorer_urls.ETHEREUM_SEPOLIA}/address/${address}">${address}</a>`;
        case SupportedNetworks.ETHERUM_GOERLI:
            return `<a href="${explorer_urls.ETHEREUM_GOERLI}/address/${address}">${address}</a>`;
        case SupportedNetworks.OPTIMISM_MAINNET:
            return `<a href="${explorer_urls.OPTIMISM_MAINNET}/address/${address}">${address}</a>`;
        case SupportedNetworks.OPTIMISM_GOERLI:
            return `<a href="${explorer_urls.OPTIMISM_GOERLI}/address/${address}">${address}</a>`;
        case SupportedNetworks.BASE_MAINNET:
            return `<a href="${explorer_urls.BASE_MAINNET}/address/${address}">${address}</a>`;
        case SupportedNetworks.BASE_GOERLI:
            return `<a href="${explorer_urls.BASE_GOERLI}/address/${address}">${address}</a>`;
        case SupportedNetworks.ZORA_MAINNET:
            return `<a href="${explorer_urls.ZORA_MAINNET}/address/${address}">${address}</a>`;
        case SupportedNetworks.ZORA_GOERLI:
            return `<a href="${explorer_urls.ZORA_GOERLI}/address/${address}">${address}</a>`;
        default:
            return fallback
                ? `<a href="${explorer_urls.LOCALHOST}/address/${address}">${address}</a>`
                : address;
    }
};

export const formatDisplayNetwork = (network: SupportedNetworks): string => {
    switch (network) {
        case SupportedNetworks.ETHEREUM_MAINNET:
            return "Ethereum Mainnet";
        case SupportedNetworks.ETHEREUM_SEPOLIA:
            return "Ethereum Sepolia";
        case SupportedNetworks.ETHERUM_GOERLI:
            return "Ethereum Goerli";
        case SupportedNetworks.OPTIMISM_MAINNET:
            return "Optimism Mainnet";
        case SupportedNetworks.OPTIMISM_GOERLI:
            return "Optimism Goerli";
        case SupportedNetworks.BASE_MAINNET:
            return "Base Mainnet";
        case SupportedNetworks.BASE_GOERLI:
            return "Base Goerli";
        case SupportedNetworks.ZORA_MAINNET:
            return "Zora Mainnet";
        case SupportedNetworks.ZORA_GOERLI:
            return "Zora Goerli";
        default:
            return "Localhost";
    }
};

export const supportedNetworkToZdkNetwork = (
    network: SupportedNetworks
): NetworkInfo | null => {
    let zdkNetwork: ZDKNetwork;
    let zdkChain: ZDKChain;

    switch (network) {
        case SupportedNetworks.ETHEREUM_MAINNET:
            zdkNetwork = ZDKNetwork.Ethereum;
            zdkChain = ZDKChain.Mainnet;
            break;
        case SupportedNetworks.ETHEREUM_SEPOLIA:
            zdkNetwork = ZDKNetwork.Ethereum;
            zdkChain = ZDKChain.Sepolia;
            break;
        case SupportedNetworks.ETHERUM_GOERLI:
            zdkNetwork = ZDKNetwork.Ethereum;
            zdkChain = ZDKChain.Goerli;
            break;
        case SupportedNetworks.OPTIMISM_MAINNET:
            zdkNetwork = ZDKNetwork.Optimism;
            zdkChain = ZDKChain.OptimismMainnet;
            break;
        case SupportedNetworks.OPTIMISM_GOERLI:
            zdkNetwork = ZDKNetwork.Optimism;
            zdkChain = ZDKChain.OptimismGoerli;
            break;
        case SupportedNetworks.BASE_MAINNET:
            zdkNetwork = ZDKNetwork.Base;
            zdkChain = ZDKChain.BaseMainnet;
            break;
        case SupportedNetworks.BASE_GOERLI:
            zdkNetwork = ZDKNetwork.Base;
            zdkChain = ZDKChain.BaseGoerli;
            break;
        case SupportedNetworks.ZORA_MAINNET:
            zdkNetwork = ZDKNetwork.Zora;
            zdkChain = ZDKChain.ZoraMainnet;
            break;
        case SupportedNetworks.ZORA_GOERLI:
            zdkNetwork = ZDKNetwork.Zora;
            zdkChain = ZDKChain.ZoraGoerli;
            break;
        default:
            return null;
    }

    return { network: zdkNetwork, chain: zdkChain };
};

export const chainIdToSupportedNetwork = (
    chainId: number
): SupportedNetworks => {
    switch (chainId) {
        case 1:
            return SupportedNetworks.ETHEREUM_MAINNET;
        case 11155111:
            return SupportedNetworks.ETHEREUM_SEPOLIA;
        case 5:
            return SupportedNetworks.ETHERUM_GOERLI;
        case 10:
            return SupportedNetworks.OPTIMISM_MAINNET;
        case 420:
            return SupportedNetworks.OPTIMISM_GOERLI;
        case 8453:
            return SupportedNetworks.BASE_MAINNET;
        case 84531:
            return SupportedNetworks.BASE_GOERLI;
        case 7777777:
            return SupportedNetworks.ZORA_MAINNET;
        case 999:
            return SupportedNetworks.ZORA_GOERLI;
        case 31337:
            return SupportedNetworks.LOCALHOST;
        default:
            return SupportedNetworks.UNDEFINED;
    }
};

export const supportedNetworkToOpenseaAssetLink = (
    network: SupportedNetworks,
    assetAddress: string,
    assetId: String
): string | null => {
    switch (network) {
        case SupportedNetworks.ETHEREUM_MAINNET:
            return `<a href="https://opensea.io/assets/ethereum/${assetAddress}/${assetId}">🔗 </a>${assetAddress}`;
        case SupportedNetworks.ETHERUM_GOERLI:
            return `<a href="https://testnets.opensea.io/assets/goerli/${assetAddress}/${assetId}">🔗 </a>${assetAddress}`;
        case SupportedNetworks.OPTIMISM_MAINNET:
            return `<a href="https://opensea.io/assets/optimism/${assetAddress}/${assetId}">🔗 </a>${assetAddress}`;
        case SupportedNetworks.BASE_MAINNET:
            return `<a href="https://opensea.io/assets/base/${assetAddress}/${assetId}">🔗 </a>${assetAddress}`;
        case SupportedNetworks.ZORA_MAINNET:
            return `<a href="https://opensea.io/assets/zora/${assetAddress}/${assetId}">🔗 </a>${assetAddress}`;
        default:
            return null;
    }
};
