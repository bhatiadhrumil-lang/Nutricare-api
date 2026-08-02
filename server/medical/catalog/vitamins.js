import { CATEGORIES } from '../categories.js';
/** Vitamin and nutrient parameters. */
export default [
  {id:'vitamin_b12',displayName:'Vitamin B12',aliases:['Cobalamin','B12'],category:CATEGORIES.VITAMINS,units:['pg/mL','pmol/L'],datatype:'number',description:'Vitamin B12 concentration.'},
  {id:'folate',displayName:'Folate',aliases:['Folic Acid','Vitamin B9','Serum Folate'],category:CATEGORIES.VITAMINS,units:['ng/mL','nmol/L'],datatype:'number',description:'Folate concentration.'},
  {id:'vitamin_d_25_hydroxy',displayName:'25-Hydroxy Vitamin D',aliases:['25-OH Vitamin D','Calcidiol','Vitamin D Total','Vitamin D','Vit D'],category:CATEGORIES.VITAMINS,units:['ng/mL','nmol/L'],datatype:'number',description:'25-hydroxy vitamin D concentration.'},
  {id:'vitamin_d_1_25_dihydroxy',displayName:'1,25-Dihydroxy Vitamin D',aliases:['Calcitriol','1,25-OH2 Vitamin D'],category:CATEGORIES.VITAMINS,units:['pg/mL','pmol/L'],datatype:'number',description:'1,25-dihydroxy vitamin D concentration.'},
  {id:'vitamin_a',displayName:'Vitamin A',aliases:['Retinol','Serum Retinol'],category:CATEGORIES.VITAMINS,units:['µg/dL','µmol/L'],datatype:'number',description:'Vitamin A concentration.'},
  {id:'vitamin_e',displayName:'Vitamin E',aliases:['Alpha-Tocopherol','Tocopherol'],category:CATEGORIES.VITAMINS,units:['mg/L','µmol/L'],datatype:'number',description:'Vitamin E concentration.'},
  {id:'vitamin_k',displayName:'Vitamin K',aliases:['Phylloquinone','Vitamin K1'],category:CATEGORIES.VITAMINS,units:['ng/mL','nmol/L'],datatype:'number',description:'Vitamin K concentration.'},
  {id:'vitamin_b1',displayName:'Vitamin B1',aliases:['Thiamine','Thiamin'],category:CATEGORIES.VITAMINS,units:['nmol/L','µg/L'],datatype:'number',description:'Vitamin B1 concentration.'},
  {id:'vitamin_b6',displayName:'Vitamin B6',aliases:['Pyridoxine','Pyridoxal 5-Phosphate','PLP'],category:CATEGORIES.VITAMINS,units:['nmol/L','µg/L'],datatype:'number',description:'Vitamin B6 concentration.'},
  {id:'vitamin_c',displayName:'Vitamin C',aliases:['Ascorbic Acid','Ascorbate'],category:CATEGORIES.VITAMINS,units:['mg/dL','µmol/L'],datatype:'number',description:'Vitamin C concentration.'},
  {id:'biotin',displayName:'Biotin',aliases:['Vitamin B7','Vitamin H'],category:CATEGORIES.VITAMINS,units:['ng/L','nmol/L'],datatype:'number',description:'Biotin concentration.'},
  {id:'niacin',displayName:'Niacin',aliases:['Vitamin B3','Nicotinic Acid'],category:CATEGORIES.VITAMINS,units:['µg/L','nmol/L'],datatype:'number',description:'Niacin measurement.'},
];
