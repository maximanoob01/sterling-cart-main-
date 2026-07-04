/**
 * Compute the base price for a weight-based product.
 * Formula: (silverRate × weightGrams) + makingCharges
 * GST is applied separately at cart/checkout level.
 */
export const computeWeightBasedPrice = (
  weightGrams,
  makingCharges,
  silverRate
) => {
  return Math.round((silverRate || 102.4) * weightGrams + makingCharges);
};
