export const levelNames = {
  1: 'Beginner',
  2: 'Core Basics',
  3: 'Applied',
  4: 'Experiment'
};

export const levelThresholds = [0, 0, 120, 320, 600];

export const baseInventory = ['H', 'O', 'C', 'N', 'Na', 'Cl'];
export const levelTwoUnlocks = ['S', 'Ca', 'K', 'Mg'];

export const items = [
  { id: 'H', name: 'Hydrogen', formula: 'H', tag: 'Energy', state: 'gas' },
  { id: 'O', name: 'Oxygen', formula: 'O', tag: 'Environment', state: 'gas' },
  { id: 'C', name: 'Carbon', formula: 'C', tag: 'Environment', state: 'solid' },
  { id: 'N', name: 'Nitrogen', formula: 'N', tag: 'Environment', state: 'gas' },
  { id: 'Na', name: 'Sodium', formula: 'Na', tag: 'Industry', state: 'solid' },
  { id: 'Cl', name: 'Chlorine', formula: 'Cl', tag: 'Daily life', state: 'gas' },
  { id: 'S', name: 'Sulfur', formula: 'S', tag: 'Environment', state: 'solid' },
  { id: 'Ca', name: 'Calcium', formula: 'Ca', tag: 'Daily life', state: 'solid' },
  { id: 'K', name: 'Potassium', formula: 'K', tag: 'Health', state: 'solid' },
  { id: 'Mg', name: 'Magnesium', formula: 'Mg', tag: 'Health', state: 'solid' },
  { id: 'water', name: 'Water', formula: 'H₂O', tag: 'Daily life', state: 'liquid' },
  { id: 'salt', name: 'Salt', formula: 'NaCl', tag: 'Daily life', state: 'solid' },
  { id: 'oxygenGas', name: 'Oxygen Gas', formula: 'O₂', tag: 'Environment', state: 'gas' },
  { id: 'hydrogenGas', name: 'Hydrogen Gas', formula: 'H₂', tag: 'Energy', state: 'gas' },
  { id: 'carbonDioxide', name: 'Carbon Dioxide', formula: 'CO₂', tag: 'Environment', state: 'gas' },
  { id: 'ammonia', name: 'Ammonia', formula: 'NH₃', tag: 'Industry', state: 'gas' },
  { id: 'methane', name: 'Methane', formula: 'CH₄', tag: 'Energy', state: 'gas' },
  { id: 'sodiumHydroxide', name: 'Sodium Hydroxide', formula: 'NaOH', tag: 'Industry', state: 'solid' },
  { id: 'hydrochloricAcid', name: 'Hydrochloric Acid', formula: 'HCl', tag: 'Industry', state: 'liquid' },
  { id: 'calciumOxide', name: 'Calcium Oxide', formula: 'CaO', tag: 'Industry', state: 'solid' },
  { id: 'potassiumChloride', name: 'Potassium Chloride', formula: 'KCl', tag: 'Health', state: 'solid' },
  { id: 'magnesiumOxide', name: 'Magnesium Oxide', formula: 'MgO', tag: 'Industry', state: 'solid' },
  { id: 'sulfurDioxide', name: 'Sulfur Dioxide', formula: 'SO₂', tag: 'Environment', state: 'gas' },
  { id: 'sulfuricAcid', name: 'Sulfuric Acid', formula: 'H₂SO₄', tag: 'Industry', state: 'liquid' },
  { id: 'ozone', name: 'Ozone', formula: 'O₃', tag: 'Environment', state: 'gas' },
  { id: 'carbonicAcid', name: 'Carbonic Acid', formula: 'H₂CO₃', tag: 'Environment', state: 'liquid' },
  { id: 'carbonMonoxide', name: 'Carbon Monoxide', formula: 'CO', tag: 'Environment', state: 'gas' },
  { id: 'rocketFuel', name: 'Rocket Fuel', formula: 'High Mix', tag: 'Energy', state: 'liquid', rarity: 'rare' },
  { id: 'electrolyte', name: 'Electrolyte Solution', formula: 'Salts + H₂O', tag: 'Energy', state: 'liquid' },
  { id: 'urea', name: 'Urea', formula: 'CH₄N₂O', tag: 'Daily life', state: 'solid' },
  { id: 'magnesiumHydroxide', name: 'Magnesium Hydroxide', formula: 'Mg(OH)₂', tag: 'Health', state: 'solid' },
  { id: 'limewater', name: 'Limewater', formula: 'Ca(OH)₂', tag: 'Environment', state: 'liquid' },
  { id: 'nitricOxide', name: 'Nitric Oxide', formula: 'NO', tag: 'Environment', state: 'gas' },
  { id: 'nitrogenDioxide', name: 'Nitrogen Dioxide', formula: 'NO₂', tag: 'Environment', state: 'gas' },
  { id: 'nitricAcid', name: 'Nitric Acid', formula: 'HNO₃', tag: 'Industry', state: 'liquid' },
  { id: 'battery', name: 'Battery', formula: 'Energy Cell', tag: 'Energy', state: 'solid', rarity: 'rare' }
];

export const itemMap = Object.fromEntries(items.map((item) => [item.id, item]));
