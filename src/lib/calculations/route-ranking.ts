export interface RouteRankingInput {
  id: string;
  name: string;
  distanceKm: number;
  physicalLossDb: number;
  spliceCount: number;
  estimatedCost: number;
  feasible: boolean;
  linkMarginDb: number;
  riskScore?: number; // 1 (low risk) to 10 (high risk)
}

export interface RankingWeights {
  distanceWeight: number; // e.g. 0.3
  lossWeight: number; // e.g. 0.3
  costWeight: number; // e.g. 0.2
  spliceWeight: number; // e.g. 0.2
}

export interface RankedRouteResult {
  routeId: string;
  routeName: string;
  score: number; // 0 - 100
  rank: number;
  feasible: boolean;
  distanceKm: number;
  physicalLossDb: number;
  linkMarginDb: number;
  spliceCount: number;
  estimatedCost: number;
  keyReasons: string[];
}

export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  distanceWeight: 0.3,
  lossWeight: 0.3,
  costWeight: 0.2,
  spliceWeight: 0.2,
};

/**
 * Calculates decision-support scores and ranks candidate OFC routes.
 */
export function rankRoutes(
  routes: RouteRankingInput[],
  weights: RankingWeights = DEFAULT_RANKING_WEIGHTS
): RankedRouteResult[] {
  if (!routes || routes.length === 0) return [];

  // Normalize weight sum to 1.0
  const totalWeight =
    weights.distanceWeight +
    weights.lossWeight +
    weights.costWeight +
    weights.spliceWeight;
  const wDist = weights.distanceWeight / (totalWeight || 1);
  const wLoss = weights.lossWeight / (totalWeight || 1);
  const wCost = weights.costWeight / (totalWeight || 1);
  const wSplice = weights.spliceWeight / (totalWeight || 1);

  // Find min/max ranges for normalization
  const distances = routes.map((r) => r.distanceKm);
  const losses = routes.map((r) => r.physicalLossDb);
  const costs = routes.map((r) => r.estimatedCost);
  const splices = routes.map((r) => r.spliceCount);

  const maxDist = Math.max(...distances, 1);
  const minDist = Math.min(...distances);
  const maxLoss = Math.max(...losses, 1);
  const minLoss = Math.min(...losses);
  const maxCost = Math.max(...costs, 1);
  const minCost = Math.min(...costs);
  const maxSplice = Math.max(...splices, 1);
  const minSplice = Math.min(...splices);

  const scored = routes.map((r) => {
    // Lower value is better for distance, loss, cost, splice count
    // Scale inverted so 1.0 is best and 0.0 is worst
    const distScore =
      maxDist === minDist ? 1.0 : 1 - (r.distanceKm - minDist) / (maxDist - minDist);
    const lossScore =
      maxLoss === minLoss ? 1.0 : 1 - (r.physicalLossDb - minLoss) / (maxLoss - minLoss);
    const costScore =
      maxCost === minCost ? 1.0 : 1 - (r.estimatedCost - minCost) / (maxCost - minCost);
    const spliceScore =
      maxSplice === minSplice ? 1.0 : 1 - (r.spliceCount - minSplice) / (maxSplice - minSplice);

    let rawScore =
      distScore * wDist +
      lossScore * wLoss +
      costScore * wCost +
      spliceScore * wSplice;

    // Apply feasibility penalty if non-feasible
    if (!r.feasible) {
      rawScore *= 0.3; // 70% score penalty for unfeasible links
    }

    const finalScore = Number((rawScore * 100).toFixed(1));

    // Generate reason highlights
    const keyReasons: string[] = [];
    if (!r.feasible) {
      keyReasons.push("⚠️ Link Not Feasible (Negative link margin)");
    } else {
      keyReasons.push("✓ Feasible optical link margin");
    }

    if (r.physicalLossDb === minLoss) {
      keyReasons.push("✓ Lowest optical link loss");
    }
    if (r.distanceKm === minDist) {
      keyReasons.push("✓ Shortest route distance");
    }
    if (r.spliceCount === minSplice) {
      keyReasons.push("✓ Fewest fiber splice points");
    }
    if (r.estimatedCost === minCost) {
      keyReasons.push("✓ Lowest estimated deployment cost");
    }
    if (r.linkMarginDb >= 8) {
      keyReasons.push("✓ Strong link margin (> 8 dB)");
    }

    return {
      routeId: r.id,
      routeName: r.name,
      score: finalScore,
      rank: 0,
      feasible: r.feasible,
      distanceKm: r.distanceKm,
      physicalLossDb: r.physicalLossDb,
      linkMarginDb: r.linkMarginDb,
      spliceCount: r.spliceCount,
      estimatedCost: r.estimatedCost,
      keyReasons,
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Assign ranks
  return scored.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));
}
