import { getStoryClient } from './client';
import { privateKeyToAccount } from "viem/accounts";

/**
 * Registers a derivative IP asset on Story Protocol by attaching it to a parent IP.
 * This is used when remixing an existing IP asset.
 *
 * @param parentIpId - The IP ID of the parent IP asset (0x address)
 * @param metadataUri - IPFS URI containing the "Proof of Creation" metadata for the derivative
 * @param nftContract - Address of the SPG NFT contract (0x address)
 * @param ipMetadataHash - Keccak256 hash of the IP metadata (0x address)
 * @param nftMetadataHash - Keccak256 hash of the NFT metadata (0x address)
 * @param nftMetadataUri - IPFS URI for the visual NFT (image)
 * @param licenseTokenId - Optional. The specific license token ID that authorizes the remix (if already minted)
 * @returns The IP ID of the registered derivative asset
 */
export async function registerDerivativeIP(
  parentIpId: `0x${string}`,
  metadataUri: string,
  nftContract: `0x${string}`,
  ipMetadataHash: `0x${string}`,
  nftMetadataHash: `0x${string}`,
  nftMetadataUri: string,
  licenseTermsId: number = 1  // Accept licenseTermsId as parameter with default of 1
): Promise<{ ipId: string; txHash: string }> {
  try {
    const client = getStoryClient();

    // Define account manually to get address (as per reference)
    const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

    // First, mint and register the IP asset
    const mintResponse = await client.ipAsset.mintAndRegisterIp({
      spgNftContract: nftContract,
      ipMetadata: {
        ipMetadataURI: metadataUri,
        ipMetadataHash: ipMetadataHash,
        nftMetadataURI: nftMetadataUri,
        nftMetadataHash: nftMetadataHash,
      },
      txOptions: {}
    });

    if (!mintResponse.ipId) {
      throw new Error("Failed to mint IP asset for derivative registration");
    }

    // Now register the derivative IP as a derivative of the parent IP using the correct license terms ID
    // We use the license terms ID that we know is valid for the parent IP (from DB or default)
    const response = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
      spgNftContract: nftContract,
      derivData: {
        parentIpIds: [parentIpId],
        licenseTermsIds: [licenseTermsId],      // Use the license terms ID passed as parameter
      },
      ipMetadata: {
        ipMetadataURI: metadataUri,
        ipMetadataHash: ipMetadataHash,
        nftMetadataURI: nftMetadataUri,
        nftMetadataHash: nftMetadataHash,
      },
      txOptions: {}
    });

    console.log('Derivative IP registered successfully:', response);

    return {
      ipId: mintResponse.ipId ? mintResponse.ipId.toString() : '',
      txHash: response.txHash ? response.txHash.toString() : '',
    };
  } catch (error) {
    console.error('Error registering derivative IP:', error);
    throw new Error(`Failed to register derivative IP: ${error}`);
  }
}

/**
 * Alternative function to register a derivative IP using registerDerivativeIp function.
 *
 * @param parentIpId - The IP ID of the parent IP asset (0x address)
 * @param metadataUri - IPFS URI containing the "Proof of Creation" metadata for the derivative
 * @param nftContract - Address of the SPG NFT contract (0x address)
 * @param ipMetadataHash - Keccak256 hash of the IP metadata (0x address)
 * @param nftMetadataHash - Keccak256 hash of the NFT metadata (0x address)
 * @param nftMetadataUri - IPFS URI for the visual NFT (image)
 * @param licenseTermsId - The license terms ID that authorizes the remix (required for derivative creation)
 * @returns The IP ID of the registered derivative asset
 */
export async function registerDerivativeIPWithLicenseTerms(
  parentIpId: `0x${string}`,
  metadataUri: string,
  nftContract: `0x${string}`,
  ipMetadataHash: `0x${string}`,
  nftMetadataHash: `0x${string}`,
  nftMetadataUri: string,
  licenseTermsId: number = 1  // Accept licenseTermsId that was validated from parent IP
): Promise<{ ipId: string; txHash: string }> {
  try {
    const client = getStoryClient();

    // Define account manually to get address
    const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

    // First, mint and register the IP asset
    const mintResponse = await client.ipAsset.mintAndRegisterIp({
      spgNftContract: nftContract,
      ipMetadata: {
        ipMetadataURI: metadataUri,
        ipMetadataHash: ipMetadataHash,
        nftMetadataURI: nftMetadataUri,
        nftMetadataHash: nftMetadataHash,
      },
      txOptions: {}
    });

    if (!mintResponse.ipId) {
      throw new Error("Failed to mint IP asset for derivative registration");
    }

    // Now register the derivative IP as a derivative of the parent IP using the correct license terms ID
    // We use the license terms ID that we know is valid for the parent IP (from DB or default)
    const response = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
      spgNftContract: nftContract,
      derivData: {
        parentIpIds: [parentIpId],
        licenseTermsIds: [licenseTermsId], // Use the license terms ID passed as parameter
      },
      ipMetadata: {
        ipMetadataURI: metadataUri,
        ipMetadataHash: ipMetadataHash,
        nftMetadataURI: nftMetadataUri,
        nftMetadataHash: nftMetadataHash,
      },
      txOptions: {}
    });

    console.log('Derivative IP registered successfully:', response);

    return {
      ipId: mintResponse.ipId ? mintResponse.ipId.toString() : '',
      txHash: response.txHash ? response.txHash.toString() : '',
    };
  } catch (error) {
    console.error('Error registering derivative IP with separate license:', error);
    throw new Error(`Failed to register derivative IP with separate license: ${error}`);
  }
}