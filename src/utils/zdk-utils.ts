import { ZDK } from "@zoralabs/zdk";
import { SupportedNetworks } from "../config/network-config";
import { supportedNetworkToZdkNetwork } from "../config/network-config";

export const getZdkInstance = (network: SupportedNetworks): ZDK => {
    const args = {
        endPoint: process.env.ZORA_API_URL,
        networks: [supportedNetworkToZdkNetwork(network)!],
    };
    const zdk = new ZDK(args);

    return zdk;
};
