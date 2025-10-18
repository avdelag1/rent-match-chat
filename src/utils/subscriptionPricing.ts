/**
 * Subscription pricing utilities
 */

export const BUNDLE_DISCOUNT_PERCENTAGE = 0.20; // 20% discount
export const LEGAL_DOCUMENT_COST = 500; // MXN per document for non-subscribers

/**
 * Calculate bundle discount when user subscribes to both client and owner packages
 */
export function calculateBundleDiscount(clientPrice: number, ownerPrice: number): number {
  const total = clientPrice + ownerPrice;
  const discount = total * BUNDLE_DISCOUNT_PERCENTAGE;
  return Math.round(discount * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate final price with bundle discount applied
 */
export function calculateBundlePrice(clientPrice: number, ownerPrice: number): number {
  const total = clientPrice + ownerPrice;
  const discount = calculateBundleDiscount(clientPrice, ownerPrice);
  return Math.round((total - discount) * 100) / 100;
}

/**
 * Format price in MXN
 */
export function formatPriceMXN(price: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(price);
}

/**
 * Get package type label
 */
export function getPackageTypeLabel(packageCategory: string): string {
  const labels: Record<string, string> = {
    client_monthly: 'Client Monthly',
    owner_monthly: 'Owner Monthly',
    client_pay_per_use: 'Client Pay-Per-Use',
    owner_pay_per_use: 'Owner Pay-Per-Use',
  };
  return labels[packageCategory] || packageCategory;
}
