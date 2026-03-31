// Generates DEFAULT_OLL_PATTERNS for index.html using cubing.js.
// Run with: node scripts/gen-oll-patterns.mjs
//
// Requires cubing to be installed:  npm install cubing
//
// How it works:
//   For each OLL algorithm, apply its inverse to the solved cube state.
//   The resulting orientation data maps directly to the 21-char Y/G pattern
//   used by the trainer's OLL diagram component.
//
// Pattern string format (21 chars, Y=yellow visible, G=not yellow):
//   pos  0- 8: U face (reading order, top-left to bottom-right from above)
//   pos  9-11: F strip top row (left→right)
//   pos 12-14: B strip top row (left→right in top-down view)
//   pos 15-17: L strip top row (back→front)
//   pos 18-20: R strip top row (back→front)
//
// cubing.js KPuzzle orbit mappings (determined empirically):
//   Edges:   UF=0, UR=1, UB=2, UL=3
//   Corners: UFR=0, UBR=1, UBL=2, UFL=3
//
// Orientation → pattern index:
//   Edge UF:  0→pat[7],  1→pat[10]
//   Edge UR:  0→pat[5],  1→pat[19]
//   Edge UB:  0→pat[1],  1→pat[13]
//   Edge UL:  0→pat[3],  1→pat[16]
//   Corner UFR: 0→pat[8], 1→pat[20](R side), 2→pat[11](F side)
//   Corner UBR: 0→pat[2], 1→pat[14](B side), 2→pat[18](R side)
//   Corner UBL: 0→pat[0], 1→pat[15](L side), 2→pat[12](B side)
//   Corner UFL: 0→pat[6], 1→pat[9](F side),  2→pat[17](L side)

import { cube3x3x3 } from "cubing/puzzles";
import { Alg } from "cubing/alg";

const OLL_ALGS = [
  { id:"OLL1",  alg:"R U2 R2 F R F' U2 R' F R F'" },
  { id:"OLL2",  alg:"F R U R' U' F' f R U R' U' f'" },
  { id:"OLL3",  alg:"f U R U' R' f' U' F R U R' U' F'" },
  { id:"OLL4",  alg:"f R U R' U' f' U F R U R' U' F'" },
  { id:"OLL5",  alg:"r' U2 R U R' U r" },
  { id:"OLL6",  alg:"r U2 R' U' R U' r'" },
  { id:"OLL7",  alg:"r U R' U R U2 r'" },
  { id:"OLL8",  alg:"r' U' R U' R' U2 r" },
  { id:"OLL9",  alg:"R U R' U' R' F R2 U R' U' F'" },
  { id:"OLL10", alg:"R U R' U R' F R F' R U2 R'" },
  { id:"OLL11", alg:"r' R2 U R' U R U2 R' U M'" },
  { id:"OLL12", alg:"M' R' U' R U' R' U2 R U' M" },
  { id:"OLL13", alg:"F U R U' R2 F' R U R U' R'" },
  { id:"OLL14", alg:"R' F R U R' F' R F U' F'" },
  { id:"OLL15", alg:"r' U' r R' U' R U r' U r" },
  { id:"OLL16", alg:"r U r' R U R' U' r U' r'" },
  { id:"OLL17", alg:"F R' F' R2 r' U R U' R' U' M'" },
  { id:"OLL18", alg:"r U R' U R U2 r2 U' R U' R' U2 r" },
  { id:"OLL19", alg:"r' R U R U R' U' M' R' F R F'" },
  { id:"OLL20", alg:"r U R' U' M2 U R U' R' U' M'" },
  { id:"OLL21", alg:"R U2 R' U' R U R' U' R U' R'" },
  { id:"OLL22", alg:"R U2 R2 U' R2 U' R2 U2 R" },
  { id:"OLL23", alg:"R2 D' R U2 R' D R U2 R" },
  { id:"OLL24", alg:"r U R' U' r' F R F'" },
  { id:"OLL25", alg:"F' r U R' U' r' F R" },
  { id:"OLL26", alg:"R U2 R' U' R U' R'" },
  { id:"OLL27", alg:"R U R' U R U2 R'" },
  { id:"OLL28", alg:"r U R' U' M U R U' R'" },
  { id:"OLL29", alg:"R U R' U' R U' R' F' U' F R U R'" },
  { id:"OLL30", alg:"F R' F R2 U' R' U' R U R' F2" },
  { id:"OLL31", alg:"R' U' F U R U' R' F' R" },
  { id:"OLL32", alg:"R U B' U' R' U R B R'" },
  { id:"OLL33", alg:"R U R' U' R' F R F'" },
  { id:"OLL34", alg:"R U R2 U' R' F R U R U' F'" },
  { id:"OLL35", alg:"R U2 R2 F R F' R U2 R'" },
  { id:"OLL36", alg:"R' U' R U' R' U R U R B' R' B" },
  { id:"OLL37", alg:"F R' F' R U R U' R'" },
  { id:"OLL38", alg:"R U R' U R U' R' U' R' F R F'" },
  { id:"OLL39", alg:"L F' L' U' L U F U' L'" },
  { id:"OLL40", alg:"R' F R U R' U' F' U R" },
  { id:"OLL41", alg:"R U R' U R U2 R' F R U R' U' F'" },
  { id:"OLL42", alg:"R' U' R U' R' U2 R F R U R' U' F'" },
  { id:"OLL43", alg:"F' U' L' U L F" },
  { id:"OLL44", alg:"F U R U' R' F'" },
  { id:"OLL45", alg:"F R U R' U' F'" },
  { id:"OLL46", alg:"R' U' R' F R F' U R" },
  { id:"OLL47", alg:"F' L' U' L U L' U' L U F" },
  { id:"OLL48", alg:"F R U R' U' R U R' U' F'" },
  { id:"OLL49", alg:"r U' r2 U r2 U r2 U' r" },
  { id:"OLL50", alg:"r' U r2 U' r2 U' r2 U r'" },
  { id:"OLL51", alg:"F U R U' R' U R U' R' F'" },
  { id:"OLL52", alg:"R U R' U R U' B U' B' R'" },
  { id:"OLL53", alg:"r' U' R U' R' U R U' R' U2 r" },
  { id:"OLL54", alg:"r U R' U R U' R' U R U2 r'" },
  { id:"OLL55", alg:"R U2 R2 U' R U' R' U2 F R F'" },
  { id:"OLL56", alg:"r' U' r U' R' U R U' R' U R r' U r" },
  { id:"OLL57", alg:"R U R' U' M' U R U' r'" },
];

const kpuzzle = await cube3x3x3.kpuzzle();
const solved = kpuzzle.defaultPattern();

const edgeMap = [
  [0, 7, 10],  // UF: orient0->top[7], orient1->F[1]
  [1, 5, 19],  // UR: orient0->top[5], orient1->R[1]
  [2, 1, 13],  // UB: orient0->top[1], orient1->B[1]
  [3, 3, 16],  // UL: orient0->top[3], orient1->L[1]
];

const cornerMap = [
  [0, 8, 20, 11],  // UFR: orient0->top[8], orient1->R[2], orient2->F[2]
  [1, 2, 14, 18],  // UBR: orient0->top[2], orient1->B[2], orient2->R[0]
  [2, 0, 15, 12],  // UBL: orient0->top[0], orient1->L[0], orient2->B[0]
  [3, 6,  9, 17],  // UFL: orient0->top[6], orient1->F[0], orient2->L[2]
];

function stateToOLLPattern(state) {
  const pat = new Array(21).fill('G');
  pat[4] = 'Y';
  const { CORNERS: corners, EDGES: edges } = state.patternData;
  for (const [pos, top, side] of edgeMap) {
    pat[edges.orientation[pos] === 0 ? top : side] = 'Y';
  }
  for (const [pos, top, s1, s2] of cornerMap) {
    const o = corners.orientation[pos];
    pat[o === 0 ? top : o === 1 ? s1 : s2] = 'Y';
  }
  return pat.join('');
}

function validatePattern(pat) {
  if (pat[4] !== 'Y') return false;
  for (const [a, b] of [[1,13],[3,16],[5,19],[7,10]]) {
    if ((pat[a]==='Y') === (pat[b]==='Y')) return false;
  }
  for (const [a, b, c] of [[0,15,12],[2,14,18],[6,9,17],[8,20,11]]) {
    const n = [a,b,c].filter(i => pat[i]==='Y').length;
    if (n !== 1) return false;
  }
  return true;
}

const results = {};
let allValid = true;
for (const { id, alg } of OLL_ALGS) {
  const state = solved.applyAlg(Alg.fromString(alg).invert());
  const pattern = stateToOLLPattern(state);
  if (!validatePattern(pattern)) {
    console.error(`INVALID: ${id} = "${pattern}"`);
    allValid = false;
  }
  results[id] = pattern;
}

if (allValid) {
  console.error("All 57 patterns valid.");
}

// Output as a JS object literal ready to paste into index.html
const lines = Object.entries(results).map(([id, pat]) => `"${id}":"${pat}"`);
console.log("const DEFAULT_OLL_PATTERNS = {");
for (let i = 0; i < lines.length; i += 2) {
  const pair = lines.slice(i, i + 2).join(",");
  console.log(pair + (i + 2 < lines.length ? "," : ""));
}
console.log("};");
