import { CATEGORIES } from '../categories.js';
/** Electrolyte and mineral parameters. */
export default [
  {id:'sodium',displayName:'Sodium',aliases:['Na','Serum Sodium'],category:CATEGORIES.ELECTROLYTES,units:['mmol/L','mEq/L'],datatype:'number',description:'Sodium concentration.'},
  {id:'potassium',displayName:'Potassium',aliases:['K','Serum Potassium'],category:CATEGORIES.ELECTROLYTES,units:['mmol/L','mEq/L'],datatype:'number',description:'Potassium concentration.'},
  {id:'chloride',displayName:'Chloride',aliases:['Cl','Serum Chloride'],category:CATEGORIES.ELECTROLYTES,units:['mmol/L','mEq/L'],datatype:'number',description:'Chloride concentration.'},
  {id:'bicarbonate',displayName:'Bicarbonate',aliases:['HCO3','Total CO2','Carbon Dioxide'],category:CATEGORIES.ELECTROLYTES,units:['mmol/L','mEq/L'],datatype:'number',description:'Bicarbonate concentration.'},
  {id:'calcium',displayName:'Calcium',aliases:['Ca','Total Calcium'],category:CATEGORIES.ELECTROLYTES,units:['mg/dL','mmol/L'],datatype:'number',description:'Total calcium concentration.'},
  {id:'ionized_calcium',displayName:'Ionized Calcium',aliases:['Free Calcium','iCa'],category:CATEGORIES.ELECTROLYTES,units:['mg/dL','mmol/L'],datatype:'number',description:'Ionized calcium concentration.'},
  {id:'magnesium',displayName:'Magnesium',aliases:['Mg','Serum Magnesium'],category:CATEGORIES.ELECTROLYTES,units:['mg/dL','mmol/L'],datatype:'number',description:'Magnesium concentration.'},
  {id:'phosphorus',displayName:'Phosphorus',aliases:['Phosphate','P','Serum Phosphorus'],category:CATEGORIES.ELECTROLYTES,units:['mg/dL','mmol/L'],datatype:'number',description:'Phosphorus concentration.'},
  {id:'osmolality',displayName:'Serum Osmolality',aliases:['Osmolality','Serum Osmolarity'],category:CATEGORIES.ELECTROLYTES,units:['mOsm/kg'],datatype:'number',description:'Serum osmolality measurement.'},
  {id:'anion_gap',displayName:'Anion Gap',aliases:['AG','Serum Anion Gap'],category:CATEGORIES.ELECTROLYTES,units:['mmol/L','mEq/L'],datatype:'number',description:'Calculated anion gap.'},
];
