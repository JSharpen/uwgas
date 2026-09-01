import { solveBetaForFixedSetup, computeTonHeights } from './src/math/tormek';

const constants = {
    rear: { hc: -10, o: 105 },
    front: { hc: 95, o: 30 }
};
const D = 250;
const A = 139;
const Dj = 12;
const Ds = 12;

// Suppose Rear base, beta = 15
const rearHeights = computeTonHeights({
    base: 'rear', D, A, betaDeg: 15, Dj, Ds, constants, angleOffsetDeg: 0
});
console.log("Rear hn:", rearHeights.hn);

// Now "direct swap" to front base in Height Mode
// We use targetValue = rearHeights.hn
const frontBetaHeightMode = solveBetaForFixedSetup('front', 220, A, Dj, Ds, constants, rearHeights.hn, 'hn');
console.log("Front Beta (Height Mode):", frontBetaHeightMode);

// Now suppose Projection Mode
const frontBetaProjMode = solveBetaForFixedSetup('front', 220, A, Dj, Ds, constants, 30, 'hn');
console.log("Front Beta (Proj Mode):", frontBetaProjMode);
