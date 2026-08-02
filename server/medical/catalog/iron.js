import { CATEGORIES } from '../categories.js';

/** Iron-study parameters. */
export default [
  { id: 'serum_iron', displayName: 'Serum Iron', aliases: ['Iron', 'Fe'], category: CATEGORIES.IRON, units: ['µg/dL', 'µmol/L'], datatype: 'number', description: 'Iron concentration in serum.' },
  { id: 'ferritin', displayName: 'Ferritin', aliases: ['Serum Ferritin'], category: CATEGORIES.IRON, units: ['ng/mL', 'µg/L'], datatype: 'number', description: 'Ferritin concentration in serum.' },
  { id: 'transferrin', displayName: 'Transferrin', aliases: ['Serum Transferrin'], category: CATEGORIES.IRON, units: ['mg/dL', 'g/L'], datatype: 'number', description: 'Transferrin concentration in serum.' },
  { id: 'total_iron_binding_capacity', displayName: 'Total Iron Binding Capacity', aliases: ['TIBC', 'Total Iron-Binding Capacity'], category: CATEGORIES.IRON, units: ['µg/dL', 'µmol/L'], datatype: 'number', description: 'Total capacity for iron binding.' },
  { id: 'unsaturated_iron_binding_capacity', displayName: 'Unsaturated Iron Binding Capacity', aliases: ['UIBC', 'Unsaturated Iron-Binding Capacity'], category: CATEGORIES.IRON, units: ['µg/dL', 'µmol/L'], datatype: 'number', description: 'Unoccupied iron binding capacity.' },
  { id: 'transferrin_saturation', displayName: 'Transferrin Saturation', aliases: ['TSAT', 'Iron Saturation'], category: CATEGORIES.IRON, units: ['%'], datatype: 'number', description: 'Proportion of transferrin bound to iron.' },
  { id: 'soluble_transferrin_receptor', displayName: 'Soluble Transferrin Receptor', aliases: ['sTfR', 'Soluble TfR'], category: CATEGORIES.IRON, units: ['mg/L'], datatype: 'number', description: 'Soluble transferrin receptor measurement.' },
  { id: 'zinc_protoporphyrin', displayName: 'Zinc Protoporphyrin', aliases: ['ZPP'], category: CATEGORIES.IRON, units: ['µmol/mol heme'], datatype: 'number', description: 'Zinc protoporphyrin measurement.' },
];
