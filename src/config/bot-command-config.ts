import {
    IBaseCommands,
    IChainCommands,
    IBaseCommandReferences,
    IChainCommandReferences,
} from "./types/bot-types";

export const base_commands: IBaseCommands = {
    START: /\/start/,
    LOAD_CONFIG: /\/load_config (.+)/,
};

export const chain_commands: IChainCommands = {
    GET_ACCOUNT: /\/account/,
    SET_ACCOUNT: /\/set_account (.+)/,
    GET_NETWORK: /\/network/,
    SET_NETWORK: /\/set_network (.+)/,
    ACCOUNT_BALANCE: /\/balance/,
};

export const base_command_references: IBaseCommandReferences = {
    START: "/start",
    LOAD_CONFIG: "/load_config",
};

export const chain_command_references: IChainCommandReferences = {
    GET_ACCOUNT: "/account",
    SET_ACCOUNT: "/set_account",
    GET_NETWORK: "/network",
    SET_NETWORK: "/set_network",
    ACCOUNT_BALANCE: "/balance",
};
