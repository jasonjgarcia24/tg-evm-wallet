export interface ILoadConfig {
    eoaAddress: string;
    network: string;
    walletAddress: string;
}

export interface IBaseCommands {
    START: RegExp;
    LOAD_CONFIG: RegExp;
}

export interface IChainCommands {
    GET_ACCOUNT: RegExp;
    SET_ACCOUNT: RegExp;
    GET_NETWORK: RegExp;
    SET_NETWORK: RegExp;
    ACCOUNT_BALANCE: RegExp;
}

export interface IBaseCommandReferences {
    START: string;
    LOAD_CONFIG: string;
}

export interface IChainCommandReferences {
    GET_ACCOUNT: string;
    SET_ACCOUNT: string;
    GET_NETWORK: string;
    SET_NETWORK: string;
    ACCOUNT_BALANCE: string;
}
