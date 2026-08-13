export interface LinkBudgetInput {
  fiberLength: number; // km
  attenuation: number; // dB/km
  spliceCount: number;
  spliceLoss: number; // dB per splice
  connectorCount: number;
  connectorLoss: number; // dB per connector
  additionalLoss: number; // dB
  txPower: number; // dBm
  rxSensitivity: number; // dBm
  safetyMargin: number; // dB
}

export interface LinkBudgetResult {
  fiberLoss: number; // dB
  spliceLoss: number; // dB
  connectorLoss: number; // dB
  additionalLoss: number; // dB
  physicalLoss: number; // dB
  receivedPower: number; // dBm
  linkMargin: number; // dB
  safetyMargin: number; // dB
  remainingMargin: number; // dB
  feasible: boolean;
  status: "FEASIBLE" | "WARNING" | "NOT_FEASIBLE";
  lossBreakdown: {
    fiberPct: number;
    splicePct: number;
    connectorPct: number;
    additionalPct: number;
  };
}

/**
 * Calculates deterministic optical fiber link budget.
 *
 * Formula:
 * - Fiber Loss = Length * Attenuation
 * - Splice Loss = Splice Count * Loss per Splice
 * - Connector Loss = Connector Count * Loss per Connector
 * - Physical Link Loss = Fiber Loss + Splice Loss + Connector Loss + Additional Loss
 * - Received Power = Tx Power - Physical Link Loss
 * - Link Margin = Received Power - Rx Sensitivity
 * - Remaining Margin = Link Margin - Safety Margin
 * - Feasible = Remaining Margin >= 0
 */
export function calculateLinkBudget(input: LinkBudgetInput): LinkBudgetResult {
  const {
    fiberLength,
    attenuation,
    spliceCount,
    spliceLoss: lossPerSplice,
    connectorCount,
    connectorLoss: lossPerConnector,
    additionalLoss,
    txPower,
    rxSensitivity,
    safetyMargin,
  } = input;

  // 1. Loss components (rounded to 2 decimal places)
  const fiberLoss = Number((fiberLength * attenuation).toFixed(2));
  const spliceLoss = Number((spliceCount * lossPerSplice).toFixed(2));
  const connectorLoss = Number((connectorCount * lossPerConnector).toFixed(2));
  const addLoss = Number((additionalLoss || 0).toFixed(2));

  // 2. Physical Link Loss (excluding safety margin to avoid double counting)
  const physicalLoss = Number((fiberLoss + spliceLoss + connectorLoss + addLoss).toFixed(2));

  // 3. Received Power & Margins
  const receivedPower = Number((txPower - physicalLoss).toFixed(2));
  const linkMargin = Number((receivedPower - rxSensitivity).toFixed(2));
  const remainingMargin = Number((linkMargin - safetyMargin).toFixed(2));

  // 4. Feasibility Determination
  const feasible = remainingMargin >= 0;
  let status: "FEASIBLE" | "WARNING" | "NOT_FEASIBLE" = "FEASIBLE";
  if (!feasible) {
    status = "NOT_FEASIBLE";
  } else if (remainingMargin < 2.0) {
    status = "WARNING";
  }

  // 5. Percentages for visual breakdown
  const totalPhysical = physicalLoss > 0 ? physicalLoss : 1;
  const fiberPct = Number(((fiberLoss / totalPhysical) * 100).toFixed(1));
  const splicePct = Number(((spliceLoss / totalPhysical) * 100).toFixed(1));
  const connectorPct = Number(((connectorLoss / totalPhysical) * 100).toFixed(1));
  const additionalPct = Number(((addLoss / totalPhysical) * 100).toFixed(1));

  return {
    fiberLoss,
    spliceLoss,
    connectorLoss,
    additionalLoss: addLoss,
    physicalLoss,
    receivedPower,
    linkMargin,
    safetyMargin,
    remainingMargin,
    feasible,
    status,
    lossBreakdown: {
      fiberPct,
      splicePct,
      connectorPct,
      additionalPct,
    },
  };
}
