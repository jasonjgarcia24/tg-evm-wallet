import fs from "fs";

const abiFolder = "./out/";

export const SAFE_DELEGATED_ERC721_PROXY_ABI = JSON.parse(
    fs.readFileSync(
        abiFolder +
            "SafeDelegatedERC721Proxy.sol/SafeDelegatedERC721Proxy.json",
        "utf8"
    )
).abi;

export const ERC721_ABI = JSON.parse(
    fs.readFileSync(abiFolder + "IERC721.sol/IERC721.json", "utf8")
).abi;

