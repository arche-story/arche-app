import { getStoryClient } from './client';

/**
 * Mints a license token that allows remixing of a parent IP asset.
 * This is required before registering a derivative IP.
 *
 * @param parentIpId - The IP ID of the parent IP asset to license from (0x address)
 * @param licenseTermsId - The ID of the license terms to use (e.g., commercial remix terms)
 * @param amount - The number of license tokens to mint (default: 1)
 * @param maxRevenueShare - The maximum revenue share percentage (for commercial licenses)
 * @returns The ID of the minted license token(s)
 */
export async function mintLicenseToken(
  parentIpId: `0x${string}`,
  licenseTermsId: number,
  amount: number = 1,
  maxRevenueShare: number = 100
): Promise<{ licenseTokenIds: string[]; txHash: string }> {
  try {
    const client = getStoryClient();

    // Mint license tokens that allow remixing of the parent IP
    const response = await client.license.mintLicenseTokens({
      licensorIpId: parentIpId,
      licenseTermsId: licenseTermsId,
      amount: amount,
      maxRevenueShare: maxRevenueShare,
      txOptions: {},
    });

    console.log('License tokens minted successfully:', response);

    // Convert bigint license token IDs to strings and txHash to string
    const licenseTokenIds = response.licenseTokenIds?.map(id => id.toString()) || [];
    const txHash = response.txHash ? response.txHash.toString() : '';

    return {
      licenseTokenIds,
      txHash,
    };
  } catch (error) {
    console.error('Error minting license token:', error);
    throw new Error(`Failed to mint license token: ${error}`);
  }
}

/**
 * Mints a commercial remix license token specifically.
 * This allows the holder to create commercial derivative works.
 *
 * @param parentIpId - The IP ID of the parent IP asset to license from (0x address)
 * @param amount - The number of license tokens to mint (default: 1)
 * @param licenseTermsId - The license terms ID to use for minting (default: 1)
 * @returns The ID of the minted license token(s)
 */
export async function mintCommercialRemixLicense(
  parentIpId: `0x${string}`,
  amount: number = 1,
  licenseTermsId: number = 1  // Accept licenseTermsId as parameter with default of 1
): Promise<{ licenseTokenIds: string[]; txHash: string }> {
  try {
    const client = getStoryClient();

    // Mint commercial remix license tokens using the provided licenseTermsId
    const response = await client.license.mintLicenseTokens({
      licensorIpId: parentIpId,
      licenseTermsId: licenseTermsId, // Use the provided licenseTermsId (no longer hardcoded to 1)
      amount: amount,
      maxRevenueShare: 100, // Allow up to 100% revenue share
      txOptions: {},
    });

    console.log('Commercial remix license tokens minted successfully:', response);

    // Convert bigint license token IDs to strings and txHash to string
    const licenseTokenIds = response.licenseTokenIds?.map(id => id.toString()) || [];
    const txHash = response.txHash ? response.txHash.toString() : '';

    return {
      licenseTokenIds,
      txHash,
    };
  } catch (error) {
    console.error('Error minting commercial remix license token:', error);
    throw new Error(`Failed to mint commercial remix license token: ${error}`);
  }
}

/**
 * Mints a non-commercial license token specifically.
 * This allows the holder to create non-commercial derivative works.
 *
 * @param parentIpId - The IP ID of the parent IP asset to license from (0x address)
 * @param amount - The number of license tokens to mint (default: 1)
 * @returns The ID of the minted license token(s)
 */
export async function mintNonCommercialLicense(
  parentIpId: `0x${string}`,
  amount: number = 1
): Promise<{ licenseTokenIds: string[]; txHash: string }> {
  try {
    const client = getStoryClient();

    // Mint non-commercial license tokens (assuming licenseTermsId = 2 for non-commercial)
    const response = await client.license.mintLicenseTokens({
      licensorIpId: parentIpId,
      licenseTermsId: 2, // Assuming 2 is the non-commercial terms ID
      amount: amount,
      maxRevenueShare: 0, // No revenue sharing for non-commercial
      txOptions: {},
    });

    console.log('Non-commercial license tokens minted successfully:', response);

    // Convert bigint license token IDs to strings and txHash to string
    const licenseTokenIds = response.licenseTokenIds?.map(id => id.toString()) || [];
    const txHash = response.txHash ? response.txHash.toString() : '';

    return {
      licenseTokenIds,
      txHash,
    };
  } catch (error) {
    console.error('Error minting non-commercial license token:', error);
    throw new Error(`Failed to mint non-commercial license token: ${error}`);
  }
}

