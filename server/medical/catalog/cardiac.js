import { CATEGORIES } from '../categories.js';
/** Cardiac biomarker parameters. */
export default [
  {id:'troponin_i',displayName:'Troponin I',aliases:['cTnI','Cardiac Troponin I'],category:CATEGORIES.CARDIAC,units:['ng/L','ng/mL'],datatype:'number',description:'Cardiac troponin I concentration.'},
  {id:'troponin_t',displayName:'Troponin T',aliases:['cTnT','Cardiac Troponin T'],category:CATEGORIES.CARDIAC,units:['ng/L','ng/mL'],datatype:'number',description:'Cardiac troponin T concentration.'},
  {id:'b_type_natriuretic_peptide',displayName:'B-Type Natriuretic Peptide',aliases:['BNP','Brain Natriuretic Peptide'],category:CATEGORIES.CARDIAC,units:['pg/mL','ng/L'],datatype:'number',description:'B-type natriuretic peptide concentration.'},
  {id:'n_terminal_pro_bnp',displayName:'N-Terminal pro-BNP',aliases:['NT-proBNP','N pro BNP'],category:CATEGORIES.CARDIAC,units:['pg/mL','ng/L'],datatype:'number',description:'N-terminal pro-BNP concentration.'},
  {id:'creatine_kinase',displayName:'Creatine Kinase',aliases:['CK','CPK','Creatine Phosphokinase'],category:CATEGORIES.CARDIAC,units:['U/L'],datatype:'number',description:'Creatine kinase activity.'},
  {id:'creatine_kinase_mb',displayName:'Creatine Kinase-MB',aliases:['CK-MB','CPK-MB'],category:CATEGORIES.CARDIAC,units:['ng/mL','U/L'],datatype:'number',description:'Creatine kinase-MB measurement.'},
  {id:'myoglobin',displayName:'Myoglobin',aliases:['Serum Myoglobin'],category:CATEGORIES.CARDIAC,units:['ng/mL','µg/L'],datatype:'number',description:'Myoglobin concentration.'},
  {id:'high_sensitivity_c_reactive_protein',displayName:'High-Sensitivity C-Reactive Protein',aliases:['hs-CRP','hsCRP'],category:CATEGORIES.CARDIAC,units:['mg/L'],datatype:'number',description:'High-sensitivity C-reactive protein concentration.'},
  {id:'homocysteine',displayName:'Homocysteine',aliases:['Hcy','Total Homocysteine'],category:CATEGORIES.CARDIAC,units:['µmol/L'],datatype:'number',description:'Homocysteine concentration.'},
];
