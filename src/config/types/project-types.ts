import { SupportedNetworks } from "../network-config";

export interface IProjectConfig {
    network: SupportedNetworks;
    mockMarketAddress: string;
    safeDelegateProxyAddress: string;
    gnosisSafeProxyAddress: string;
    safeAddress: string;
    eoaOwnerAddress: string;
    demoNftAddresses: string[];
    demoNftTokenIds: string[];
}
