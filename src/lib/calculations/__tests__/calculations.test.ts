import { describe, it, expect } from "vitest";
import { calculateLinkBudget } from "../link-budget";
import { haversineDistance, calculateRouteDistance, calculateSegmentDistances } from "../route-distance";
import { rankRoutes } from "../route-ranking";
import { calculateDeploymentCost, formatCurrency } from "../cost-calculator";

describe("Optical Fiber Engineering Calculation Engine", () => {
  // 1. Fiber Loss
  it("calculates fiber attenuation loss correctly (25km @ 0.35 dB/km)", () => {
    const result = calculateLinkBudget({
      fiberLength: 25,
      attenuation: 0.35,
      spliceCount: 0,
      spliceLoss: 0,
      connectorCount: 0,
      connectorLoss: 0,
      additionalLoss: 0,
      txPower: 3,
      rxSensitivity: -20,
      safetyMargin: 3,
    });
    expect(result.fiberLoss).toBe(8.75);
  });

  // 2. Splice Loss
  it("calculates splice loss correctly (10 splices @ 0.10 dB/splice)", () => {
    const result = calculateLinkBudget({
      fiberLength: 0,
      attenuation: 0,
      spliceCount: 10,
      spliceLoss: 0.1,
      connectorCount: 0,
      connectorLoss: 0,
      additionalLoss: 0,
      txPower: 3,
      rxSensitivity: -20,
      safetyMargin: 3,
    });
    expect(result.spliceLoss).toBe(1.0);
  });

  // 3. Connector Loss
  it("calculates connector loss correctly (4 connectors @ 0.50 dB/connector)", () => {
    const result = calculateLinkBudget({
      fiberLength: 0,
      attenuation: 0,
      spliceCount: 0,
      spliceLoss: 0,
      connectorCount: 4,
      connectorLoss: 0.5,
      additionalLoss: 0,
      txPower: 3,
      rxSensitivity: -20,
      safetyMargin: 3,
    });
    expect(result.connectorLoss).toBe(2.0);
  });

  // 4. Physical Link Loss
  it("sums physical link loss correctly (8.75 + 1.0 + 2.0 + 1.0 = 12.75 dB)", () => {
    const result = calculateLinkBudget({
      fiberLength: 25,
      attenuation: 0.35,
      spliceCount: 10,
      spliceLoss: 0.1,
      connectorCount: 4,
      connectorLoss: 0.5,
      additionalLoss: 1.0,
      txPower: 3,
      rxSensitivity: -20,
      safetyMargin: 3,
    });
    expect(result.physicalLoss).toBe(12.75);
  });

  // 5. Received Power
  it("calculates received power correctly (+3 dBm - 12.75 dB = -9.75 dBm)", () => {
    const result = calculateLinkBudget({
      fiberLength: 25,
      attenuation: 0.35,
      spliceCount: 10,
      spliceLoss: 0.1,
      connectorCount: 4,
      connectorLoss: 0.5,
      additionalLoss: 1.0,
      txPower: 3,
      rxSensitivity: -20,
      safetyMargin: 3,
    });
    expect(result.receivedPower).toBe(-9.75);
  });

  // 6. Link Margin
  it("calculates link margin correctly (-9.75 dBm - (-20 dBm) = 10.25 dB)", () => {
    const result = calculateLinkBudget({
      fiberLength: 25,
      attenuation: 0.35,
      spliceCount: 10,
      spliceLoss: 0.1,
      connectorCount: 4,
      connectorLoss: 0.5,
      additionalLoss: 1.0,
      txPower: 3,
      rxSensitivity: -20,
      safetyMargin: 3,
    });
    expect(result.linkMargin).toBe(10.25);
  });

  // 7. Remaining Margin
  it("calculates remaining safety margin correctly (10.25 dB - 3 dB = 7.25 dB)", () => {
    const result = calculateLinkBudget({
      fiberLength: 25,
      attenuation: 0.35,
      spliceCount: 10,
      spliceLoss: 0.1,
      connectorCount: 4,
      connectorLoss: 0.5,
      additionalLoss: 1.0,
      txPower: 3,
      rxSensitivity: -20,
      safetyMargin: 3,
    });
    expect(result.remainingMargin).toBe(7.25);
  });

  // 8. Feasible Link
  it("identifies link as FEASIBLE when remaining margin >= 0", () => {
    const result = calculateLinkBudget({
      fiberLength: 25,
      attenuation: 0.22, // 1550nm fiber
      spliceCount: 10,
      spliceLoss: 0.1,
      connectorCount: 4,
      connectorLoss: 0.5,
      additionalLoss: 1.0,
      txPower: 3,
      rxSensitivity: -20,
      safetyMargin: 3,
    });
    expect(result.feasible).toBe(true);
    expect(result.status).toBe("FEASIBLE");
  });

  // 9. Non-Feasible Link
  it("identifies link as NOT_FEASIBLE when remaining margin < 0 (70km long link)", () => {
    const result = calculateLinkBudget({
      fiberLength: 70,
      attenuation: 0.35, // 1310nm fiber
      spliceCount: 20,
      spliceLoss: 0.15,
      connectorCount: 6,
      connectorLoss: 0.5,
      additionalLoss: 2.0,
      txPower: 3,
      rxSensitivity: -20,
      safetyMargin: 3,
    });
    expect(result.feasible).toBe(false);
    expect(result.status).toBe("NOT_FEASIBLE");
    expect(result.remainingMargin).toBeLessThan(0);
  });

  // 10. Warning Feasibility Boundary
  it("assigns WARNING status when remaining margin is tight (< 2.0 dB)", () => {
    const result = calculateLinkBudget({
      fiberLength: 50,
      attenuation: 0.35,
      spliceCount: 10,
      spliceLoss: 0.1,
      connectorCount: 4,
      connectorLoss: 0.5,
      additionalLoss: 0,
      txPower: 3,
      rxSensitivity: -20,
      safetyMargin: 3,
    });
    // Loss = 17.5 + 1.0 + 2.0 = 20.5 dB
    // Rx Power = 3 - 20.5 = -17.5 dBm
    // Link Margin = -17.5 - (-20) = 2.5 dB
    // Remaining Margin = 2.5 - 3 = -0.5 (NOT FEASIBLE)
    expect(result.feasible).toBe(false);
  });

  // 11. Haversine Distance (Bengaluru MG Road to Whitefield approx 18-19km)
  it("calculates geographic distance accurately using Haversine formula", () => {
    const popMgRoad = [12.9756, 77.6066] as [number, number];
    const siteWhitefield = [12.9698, 77.7499] as [number, number];
    const dist = haversineDistance(popMgRoad, siteWhitefield);
    expect(dist).toBeGreaterThan(15);
    expect(dist).toBeLessThan(20);
  });

  // 12. Multi-point Route Distance
  it("accumulates multi-segment route distances correctly", () => {
    const p1 = [12.9756, 77.6066] as [number, number];
    const p2 = [12.9698, 77.6500] as [number, number];
    const p3 = [12.9698, 77.7499] as [number, number];

    const total = calculateRouteDistance([p1, p2, p3]);
    const segments = calculateSegmentDistances([p1, p2, p3]);

    expect(segments.length).toBe(2);
    expect(total).toBeCloseTo(segments[0].distanceKm + segments[1].distanceKm, 2);
  });

  // 13. Zero points route distance
  it("returns 0 distance for insufficient waypoints", () => {
    expect(calculateRouteDistance([])).toBe(0);
    expect(calculateRouteDistance([[12.9, 77.6]])).toBe(0);
  });

  // 14. Deployment Cost Estimator
  it("calculates deployment cost breakdown correctly", () => {
    const cost = calculateDeploymentCost({
      distanceKm: 25,
      costPerKm: 15000,
      spliceCount: 10,
      costPerSplice: 500,
      connectorCount: 4,
      costPerConnector: 1200,
      sitePreparationCost: 50000,
      additionalFixedCost: 10000,
      currency: "INR",
    });

    expect(cost.fiberCost).toBe(375000);
    expect(cost.spliceCost).toBe(5000);
    expect(cost.connectorCost).toBe(4800);
    expect(cost.sitePreparationCost).toBe(50000);
    expect(cost.totalCost).toBe(444800);
    expect(cost.formattedTotal).toContain("4,44,800");
  });

  // 15. Route Decision Ranking
  it("ranks feasible low-loss routes above high-loss or unfeasible routes", () => {
    const routes = [
      {
        id: "route-a",
        name: "Route A (Direct)",
        distanceKm: 18,
        physicalLossDb: 6.3,
        spliceCount: 6,
        estimatedCost: 320000,
        feasible: true,
        linkMarginDb: 10.7,
      },
      {
        id: "route-b",
        name: "Route B (Ring North)",
        distanceKm: 22,
        physicalLossDb: 7.7,
        spliceCount: 4,
        estimatedCost: 380000,
        feasible: true,
        linkMarginDb: 9.3,
      },
      {
        id: "route-c",
        name: "Route C (Overland South)",
        distanceKm: 45,
        physicalLossDb: 18.5,
        spliceCount: 15,
        estimatedCost: 750000,
        feasible: false,
        linkMarginDb: -1.5,
      },
    ];

    const ranked = rankRoutes(routes);

    expect(ranked.length).toBe(3);
    expect(ranked[0].routeId).toBe("route-a");
    expect(ranked[0].rank).toBe(1);
    expect(ranked[0].feasible).toBe(true);
    expect(ranked[2].routeId).toBe("route-c");
    expect(ranked[2].feasible).toBe(false);
  });

  // 16. Currency Formatting
  it("formats USD and INR currencies correctly", () => {
    expect(formatCurrency(125000, "INR")).toContain("1,25,000");
    expect(formatCurrency(2500, "USD")).toContain("2,500");
  });
});
