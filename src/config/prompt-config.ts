import { chain_command_references } from "./bot-command-config";

// Greeting Prompts
export const GREETING: string = `
NFTbot is the worlds first NFT sniper bot. Don't miss a beat and mint the hottest NFTs on the market, all from inside Telegram. 

Navigate NFTs across various chains without having to worry about switching networks. No more clunky UX. Buying NFTs has never been easier. 

Click the button below to get started.
`;

export const NFT_PURCHASE_GREETING: string = `
Welcome to NFT Direct Purchases!

This feature allows you to purchase NFTs directly from the contract address and token ID.

See below for the available NFTs! 👀
`;

export const NFT_PURCHASE_INSTRUCTIONS: string = `
❗Please enter the contract address and token ID
❗of the NFT you would like to purchase.
`;

export const NFT_PURCHASE_EXAMPLE: string = `
<pre>Ex: 0xd774557b647330c91bf44cfeab205095f7e6c367, 1234
   |-------------Contract Address-------------|-ID--|</pre>
`;

// Account Prompts
export const INVALID_ETH_ADDRESS: string = `Invalid Ethereum address. Please send your Ethereum address after typing ${chain_command_references.SET_ACCOUNT}`;
export const INVALID_ETH_BALANCE: string = `Invalid Ethereum balance.`;

// Contract Prompts
export const INVALID_TOKEN_ADDRESS: string = `Invalid token contract address. Please send the token contract address and ID again.`;
export const INVALID_TOKEN_ID: string = `Invalid token ID. Please send the token contract address and ID again.`;

// Network Prompts
export const PROMPT_NETWORK = (network: string): string =>
    `Current network: ${network}`;
export const UNDEFINED_NETWORK = `The network is currently undefined. Please set your network after typing ${chain_command_references.SET_NETWORK}`;
export const INVALID_NETWORK = `Invalid network. Please set your network after typing ${chain_command_references.SET_NETWORK}`;

// Error Handling Prompts
export const QUERY_FAILED = "Something went wrong. Query message is undefined.";
