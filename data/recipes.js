export const orderDependentCombos = new Set();

export const recipes = [
  { combo: ['H', 'O'], result: 'water' },
  { combo: ['Na', 'Cl'], result: 'salt' },
  { combo: ['O', 'O'], result: 'oxygenGas' },
  { combo: ['H', 'H'], result: 'hydrogenGas' },
  { combo: ['C', 'O'], result: 'carbonDioxide', requiresHeat: true },
  { combo: ['N', 'H'], result: 'ammonia' },
  { combo: ['C', 'H'], result: 'methane' },
  { combo: ['Na', 'water'], result: 'sodiumHydroxide' },
  { combo: ['H', 'Cl'], result: 'hydrochloricAcid' },
  { combo: ['Ca', 'O'], result: 'calciumOxide', requiresHeat: true },
  { combo: ['K', 'Cl'], result: 'potassiumChloride' },
  { combo: ['Mg', 'O'], result: 'magnesiumOxide', requiresHeat: true },
  { combo: ['S', 'O'], result: 'sulfurDioxide' },
  { combo: ['sulfurDioxide', 'water'], result: 'sulfuricAcid' },
  { combo: ['oxygenGas', 'O'], result: 'ozone' },
  { combo: ['water', 'carbonDioxide'], result: 'carbonicAcid' },
  { combo: ['C', 'oxygenGas'], result: 'carbonMonoxide', requiresHeat: true },
  { combo: ['carbonMonoxide', 'O'], result: 'carbonDioxide' },
  { combo: ['hydrogenGas', 'oxygenGas'], result: 'rocketFuel', requiresHeat: true },
  { combo: ['sodiumHydroxide', 'hydrochloricAcid'], result: 'salt' },
  { combo: ['potassiumChloride', 'water'], result: 'electrolyte' },
  { combo: ['ammonia', 'carbonDioxide'], result: 'urea' },
  { combo: ['magnesiumOxide', 'water'], result: 'magnesiumHydroxide' },
  { combo: ['calciumOxide', 'water'], result: 'limewater' },
  { combo: ['N', 'O'], result: 'nitricOxide' },
  { combo: ['nitricOxide', 'O'], result: 'nitrogenDioxide' },
  { combo: ['nitrogenDioxide', 'water'], result: 'nitricAcid' },
  { combo: ['carbonDioxide', 'magnesiumHydroxide'], result: 'magnesiumOxide' },
  { combo: ['C', 'Mg'], result: 'battery', requiresHeat: true }
];

export const recipeMap = recipes.reduce((map, recipe) => {
  const key = canonicalKey(recipe.combo[0], recipe.combo[1]);
  map[key] = { result: recipe.result, requiresHeat: !!recipe.requiresHeat };
  return map;
}, {});

export function canonicalKey(a, b) {
  const pair = [a, b];
  const joined = `${a}+${b}`;
  if (orderDependentCombos.has(joined)) return joined;
  pair.sort();
  return `${pair[0]}+${pair[1]}`;
}
