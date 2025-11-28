import { getStoryClient } from "./client";
import { PILFlavor } from "@story-protocol/core-sdk";
import { Address, toHex } from "viem";

// WIP Token Address on Aeneid Testnet
// This is the ERC20 token used for payments/royalties on the testnet
const WIP_TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_WIP_TOKEN_ADDRESS ||
  "0x1514000000000000000000000000000000000000"; // Official WIP token address for Aeneid

/**
 * Registers a new Genesis IP Asset with Commercial Remix terms.
 * This is the "Origin" of a creative chain.
 */
export async function registerGenesisIP(
  recipient: Address,
  ipMetadataURI: string,
  ipMetadataHash: string,
  nftMetadataURI: string,
  nftMetadataHash: string
) {
  const client = getStoryClient();
  const nftContract = process.env.NEXT_PUBLIC_SPG_NFT_CONTRACT as Address;

  if (!nftContract)
    throw new Error("NFT Contract not configured in environment");

  console.log(`🚀 Minting Genesis IP for ${recipient}...`);

  try {
    // Atomic Mint & Register with Commercial Remix Terms
    const response = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
      spgNftContract: nftContract,
      recipient, // Mint directly to the user
      allowDuplicates: true,
      licenseTermsData: [
        {
          terms: PILFlavor.commercialRemix({
            commercialRevShare: 10, // 10% Royalty to creator
            defaultMintingFee: BigInt(0), // Free to mint the license
            currency: WIP_TOKEN_ADDRESS as Address,
          }),
        },
      ],
      ipMetadata: {
        ipMetadataURI,
        ipMetadataHash: ipMetadataHash.startsWith("0x")
          ? (ipMetadataHash as `0x${string}`)
          : toHex(ipMetadataHash, { size: 32 }),
        nftMetadataURI,
        nftMetadataHash: nftMetadataHash.startsWith("0x")
          ? (nftMetadataHash as `0x${string}`)
          : toHex(nftMetadataHash, { size: 32 }),
      },
      txOptions: {},
    });

    console.log(`✅ Genesis IP Registered: ${response.ipId}`);

    return {
      success: true,
      ipId: response.ipId,
      tokenId: response.tokenId?.toString(),
      txHash: response.txHash,
      licenseTermsId: response.licenseTermsIds?.[0],
    };
  } catch (error) {
    console.error("❌ Failed to register Genesis IP:", error);
    throw error;
  }
}

/**
 * Registers a Derivative IP (Remix).
 * Requires the caller (server wallet) to mint a license from the parent first.
 */
export async function registerDerivativeIP(
  recipient: Address,
  parentIpId: Address,
  licenseTermsId: number, // The specific License Terms ID attached to the parent
  ipMetadataURI: string,
  ipMetadataHash: string,
  nftMetadataURI: string,
  nftMetadataHash: string
) {
  const client = getStoryClient();
  const nftContract = process.env.NEXT_PUBLIC_SPG_NFT_CONTRACT as Address;

  if (!nftContract) throw new Error("NFT Contract not configured");

  console.log(
    `🚀 Starting Derivative Registration for Parent: ${parentIpId} to Recipient: ${recipient}`
  );

  try {
    // Step 1: Mint License Token to the recipient directly instead of server wallet
    // This will allow the recipient to register the derivative IP

    console.log("  - Step 1: Minting License Token to Recipient...");
    const mintLicenseResponse = await client.license.mintLicenseTokens({
      licensorIpId: parentIpId,
      licenseTermsId: licenseTermsId,
      amount: 1,
      receiver: recipient, // Mint directly to the recipient
      txOptions: {},
    });

    const licenseTokenId = mintLicenseResponse.licenseTokenIds?.[0];
    if (!licenseTokenId) throw new Error("Failed to mint license token");
    console.log(`    License Token Minted: ${licenseTokenId}`);

    // Step 2: Register Derivative using the License Token
    const response = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
      spgNftContract: nftContract,
      recipient: recipient, // The User gets the final IP
      derivData: {
        parentIpIds: [parentIpId],
        licenseTermsIds: [licenseTermsId],
      },
      allowDuplicates: true,
      ipMetadata: {
        ipMetadataURI,
        ipMetadataHash: ipMetadataHash.startsWith("0x")
          ? (ipMetadataHash as `0x${string}`)
          : toHex(ipMetadataHash, { size: 32 }),
        nftMetadataURI,
        nftMetadataHash: nftMetadataHash.startsWith("0x")
          ? (nftMetadataHash as `0x${string}`)
          : toHex(nftMetadataHash, { size: 32 }),
      },
      txOptions: {},
    });

    console.log(`✅ Derivative IP Registered: ${response.ipId}`);

    return {
      success: true,
      ipId: response.ipId,
      tokenId: response.tokenId?.toString(),
      txHash: response.txHash,
      parentIpId: parentIpId,
    };
  } catch (error) {
    console.error("❌ Failed to register Derivative IP:", error);
    throw error;
  }
}
