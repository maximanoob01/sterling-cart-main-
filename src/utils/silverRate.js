/**
 * Live silver rate reference (925 sterling silver, per gram).
 * This is the indicative retail reference price used for weight-based product pricing.
 * Update this value when the silver rate changes.
 */
export const SILVER_RATE_PER_GRAM = 102.4; // ₹ per gram

/**
 * Compute the base price for a weight-based product.
 * Formula: (silverRate × weightGrams) + makingCharges
 * GST is applied separately at cart/checkout level.
 *
 * @param {number} weightGrams   - Product weight in grams
 * @param {number} makingCharges - Fixed making charges for this product (₹)
 * @param {number} [silverRate]  - Override silver rate (defaults to SILVER_RATE_PER_GRAM)
 * @returns {number} Base price before GST
 */
export const computeWeightBasedPrice = (
  weightGrams,
  makingCharges,
  silverRate = SILVER_RATE_PER_GRAM
) => {
  return Math.round(silverRate * weightGrams + makingCharges);
};
