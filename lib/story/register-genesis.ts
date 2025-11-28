import { PILFlavor } from '@story-protocol/core-sdk';
import { getStoryClient } from './client';
import { parseEther } from 'viem';

/**
 * Registers a genesis IP asset on Story Protocol with commercial remix license terms.
 *
 * @param metadataUri - IPFS URI containing the "Proof of Creation" metadata
 * @param nftContract - Address of the SPG NFT contract (0x address)
 * @param ipMetadataHash - Keccak256 hash of the IP metadata (0x address)
 * @param nftMetadataHash - Keccak256 hash of the NFT metadata (0x address)
 * @param nftMetadataUri - IPFS URI for the visual NFT (image)
 * @returns The IP ID of the registered asset
 */
export async function registerGenesisIP(
  metadataUri: string,
  nftContract: `0x${string}`,
  ipMetadataHash: `0x${string}`,
  nftMetadataHash: `0x${string}`,
  nftMetadataUri: string
): Promise<{ ipId: string; txHash: string; licenseTermsId?: string }> {
  try {
    const client = getStoryClient();

    // Configuration from ENV with safe defaults
    const mintingFee = process.env.NEXT_PUBLIC_DEFAULT_MINTING_FEE || '0';
    const revShare = process.env.NEXT_PUBLIC_COMMERCIAL_REV_SHARE || '10';
    const currencyAddress = (process.env.NEXT_PUBLIC_WIP_TOKEN_ADDRESS as `0x${string}`) || '0x1514000000000000000000000000000000000000';

    // Register IP asset with commercial remix license terms
    const response = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
      spgNftContract: nftContract,
      ipMetadata: {
        ipMetadataURI: metadataUri,
        ipMetadataHash: ipMetadataHash,
        nftMetadataURI: nftMetadataUri,
        nftMetadataHash: nftMetadataHash,
      },
      licenseTermsData: [
        {
          terms: PILFlavor.commercialRemix({
            commercialRevShare: parseInt(revShare), // Revenue share percentage from env
            defaultMintingFee: parseEther(mintingFee), // Minting fee from env, converted to wei
            currency: currencyAddress, // WIP token address
          }),
        }
      ],
      txOptions: {},
    });

    console.log('Genesis IP registered successfully:', response);

    return {
      ipId: response.ipId ? response.ipId.toString() : '',
      txHash: response.txHash ? response.txHash.toString() : '',
      licenseTermsId: response.licenseTermsIds ? response.licenseTermsIds[0]?.toString() : undefined,
    };
  } catch (error) {
    console.error('Error registering genesis IP:', error);
    throw new Error(`Failed to register genesis IP: ${error}`);
  }
}

/**
 * Alternative function for registering genesis IP with non-commercial license terms.
 *
 * @param metadataUri - IPFS URI containing the "Proof of Creation" metadata
 * @param nftContract - Address of the SPG NFT contract (0x address)
 * @param ipMetadataHash - Keccak256 hash of the IP metadata (0x address)
 * @param nftMetadataHash - Keccak256 hash of the NFT metadata (0x address)
 * @param nftMetadataUri - IPFS URI for the visual NFT (image)
 * @returns The IP ID of the registered asset
 */
export async function registerGenesisIPNonCommercial(
  metadataUri: string,
  nftContract: `0x${string}`,
  ipMetadataHash: `0x${string}`,
  nftMetadataHash: `0x${string}`,
  nftMetadataUri: string
): Promise<{ ipId: string; txHash: string; licenseTermsId?: string }> {
  try {
    const client = getStoryClient();

    // Register IP asset with non-commercial license terms (these usually don't require currency parameter)
    const response = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
      spgNftContract: nftContract,
      ipMetadata: {
        ipMetadataURI: metadataUri,
        ipMetadataHash: ipMetadataHash,
        nftMetadataURI: nftMetadataUri,
        nftMetadataHash: nftMetadataHash,
      },
      licenseTermsData: [
        {
          terms: PILFlavor.nonCommercialSocialRemixing({}),
        }
      ],
      txOptions: {},
    });

    console.log('Genesis IP (non-commercial) registered successfully:', response);

    return {
      ipId: response.ipId ? response.ipId.toString() : '',
      txHash: response.txHash ? response.txHash.toString() : '',
      licenseTermsId: response.licenseTermsIds ? response.licenseTermsIds[0]?.toString() : undefined,
    };
  } catch (error) {
    console.error('Error registering genesis IP (non-commercial):', error);
    throw new Error(`Failed to register genesis IP (non-commercial): ${error}`);
  }
}