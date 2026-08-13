export interface CostCalculatorInput {
  distanceKm: number;
  costPerKm?: number; // default ₹15,000 / km or $200 / km
  spliceCount: number;
  costPerSplice?: number; // default ₹500 / splice
  connectorCount: number;
  costPerConnector?: number; // default ₹1,200 / connector
  sitePreparationCost?: number; // default ₹50,000
  additionalFixedCost?: number; // default 0
  currency?: "INR" | "USD" | "EUR";
}

export interface CostBreakdown {
  fiberCost: number;
  spliceCost: number;
  connectorCost: number;
  sitePreparationCost: number;
  additionalFixedCost: number;
  totalCost: number;
  formattedTotal: string;
  currency: string;
}

export const DEFAULT_COST_CONFIG = {
  INR: {
    costPerKm: 15000,
    costPerSplice: 500,
    costPerConnector: 1200,
    sitePreparationCost: 50000,
  },
  USD: {
    costPerKm: 200,
    costPerSplice: 10,
    costPerConnector: 25,
    sitePreparationCost: 850,
  },
  EUR: {
    costPerKm: 180,
    costPerSplice: 9,
    costPerConnector: 22,
    sitePreparationCost: 800,
  },
};

/**
 * Calculates estimated deployment cost breakdown.
 */
export function calculateDeploymentCost(
  input: CostCalculatorInput
): CostBreakdown {
  const currency = input.currency || "INR";
  const defaults = DEFAULT_COST_CONFIG[currency] || DEFAULT_COST_CONFIG.INR;

  const costPerKm = input.costPerKm ?? defaults.costPerKm;
  const costPerSplice = input.costPerSplice ?? defaults.costPerSplice;
  const costPerConnector = input.costPerConnector ?? defaults.costPerConnector;
  const sitePrep = input.sitePreparationCost ?? defaults.sitePreparationCost;
  const additional = input.additionalFixedCost ?? 0;

  const fiberCost = Number((input.distanceKm * costPerKm).toFixed(2));
  const spliceCost = Number((input.spliceCount * costPerSplice).toFixed(2));
  const connectorCost = Number((input.connectorCount * costPerConnector).toFixed(2));
  const sitePreparationCost = Number(sitePrep.toFixed(2));
  const additionalFixedCost = Number(additional.toFixed(2));

  const totalCost = Number(
    (fiberCost + spliceCost + connectorCost + sitePreparationCost + additionalFixedCost).toFixed(2)
  );

  const formattedTotal = formatCurrency(totalCost, currency);

  return {
    fiberCost,
    spliceCost,
    connectorCost,
    sitePreparationCost,
    additionalFixedCost,
    totalCost,
    formattedTotal,
    currency,
  };
}

export function formatCurrency(amount: number, currency = "INR"): string {
  if (currency === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
