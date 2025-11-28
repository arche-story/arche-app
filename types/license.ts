export type LicenseType = "NON_COMMERCIAL" | "COMMERCIAL";

export interface LicenseParams {
    type: LicenseType;
    mintingFee: string; // in IP Tokens (string for input handling)
    commercialRevShare: number; // 0-100
}
