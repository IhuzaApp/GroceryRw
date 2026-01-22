import { hasuraClient } from "./hasuraClient";
import { gql } from "graphql-request";

// GraphQL query to fetch tax rate from system configuration
const GET_TAX_RATE = gql`
  query getTaxRate {
    System_configuratioins(limit: 1) {
      tax
    }
  }
`;

interface TaxRateResponse {
  System_configuratioins: Array<{
    tax: string;
  }>;
}

/**
 * Get tax rate from system configuration
 * @returns Promise<number> - Tax rate as a decimal (e.g., 0.18 for 18%)
 */
export async function getTaxRate(): Promise<number> {
  try {
    if (!hasuraClient) {
      console.warn('Hasura client not available, using default tax rate of 18%');
      return 0.18; // Default fallback
    }

    const data = await hasuraClient.request<TaxRateResponse>(GET_TAX_RATE);

    if (data.System_configuratioins && data.System_configuratioins.length > 0) {
      const taxString = data.System_configuratioins[0].tax;
      if (taxString) {
        // Convert percentage string to decimal (e.g., "18" -> 0.18)
        const taxRate = parseFloat(taxString) / 100;
        if (!isNaN(taxRate) && taxRate >= 0 && taxRate <= 1) {
          return taxRate;
        }
      }
    }

    console.warn('Tax rate not found in system configuration, using default of 18%');
    return 0.18; // Default fallback
  } catch (error) {
    console.error('Error fetching tax rate:', error);
    return 0.18; // Default fallback
  }
}

/**
 * Calculate tax amount using the formula: total * (taxRate / (1 + taxRate))
 * This gives the tax portion of a total that includes tax
 * @param totalWithTax - The total amount including tax
 * @param taxRate - Tax rate as decimal (e.g., 0.18 for 18%)
 * @returns number - The tax amount
 */
export function calculateTaxAmount(totalWithTax: number, taxRate: number = 0.18): number {
  return totalWithTax * (taxRate / (1 + taxRate));
}

/**
 * Calculate subtotal from total by removing tax
 * @param totalWithTax - The total amount including tax
 * @param taxRate - Tax rate as decimal (e.g., 0.18 for 18%)
 * @returns number - The subtotal amount (total minus tax)
 */
export function calculateSubtotalFromTotal(totalWithTax: number, taxRate: number = 0.18): number {
  return totalWithTax - calculateTaxAmount(totalWithTax, taxRate);
}