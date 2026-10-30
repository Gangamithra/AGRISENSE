export function calculateFinancialLoss({
    expectedHarvest,
    affectedHarvest,
    estimatedLossPercent,
    marketPrice,
  }) {
    const expected = Number(expectedHarvest);
    const affected = Number(affectedHarvest);
    const lossPercent = Number(estimatedLossPercent);
    const price = Number(marketPrice);

    if (
      !Number.isFinite(expected) ||
      !Number.isFinite(affected) ||
      !Number.isFinite(lossPercent) ||
      !Number.isFinite(price)
    ) {
      throw new Error("Please enter valid numerical values.");
    }

    if (expected <= 0) {
      throw new Error("Expected harvest must be greater than zero.");
    }

    if (affected < 0 || affected > expected) {
      throw new Error(
        "Affected harvest must be between zero and expected harvest."
      );
    }

    if (lossPercent < 0 || lossPercent > 100) {
      throw new Error("Estimated loss must be between 0 and 100.");
    }

    if (price < 0) {
      throw new Error("Market price cannot be negative.");
    }

    const lostQuantity = affected * (lossPercent / 100);
    const expectedRevenue = expected * price;
    const estimatedRevenueLoss = lostQuantity * price;
    const revenueAfterLoss = expectedRevenue - estimatedRevenueLoss;

    return {
      expectedHarvest: expected,
      affectedHarvest: affected,
      estimatedLossPercent: lossPercent,
      lostQuantity,
      expectedRevenue,
      estimatedRevenueLoss,
      revenueAfterLoss,
      marketPrice: price,
    };
  }