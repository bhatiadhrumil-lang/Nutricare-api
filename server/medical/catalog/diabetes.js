import { CATEGORIES } from '../categories.js';
/** Diabetes and glycemic parameters. */
export default [
  { id:'fasting_plasma_glucose', displayName:'Fasting Plasma Glucose', aliases:['FPG','FBS','Fasting Blood Sugar','Fasting Glucose'], category:CATEGORIES.DIABETES, units:['mg/dL','mmol/L'], datatype:'number', description:'Glucose concentration after fasting.' },
  { id:'random_plasma_glucose', displayName:'Random Plasma Glucose', aliases:['RPG','RBS','Random Blood Sugar'], category:CATEGORIES.DIABETES, units:['mg/dL','mmol/L'], datatype:'number', description:'Glucose concentration in a random sample.' },
  { id:'postprandial_glucose', displayName:'Postprandial Glucose', aliases:['PPBS','PPG','2-Hour Postprandial Glucose'], category:CATEGORIES.DIABETES, units:['mg/dL','mmol/L'], datatype:'number', description:'Glucose concentration after a meal.' },
  { id:'oral_glucose_tolerance_test', displayName:'Oral Glucose Tolerance Test', aliases:['OGTT','Glucose Tolerance Test'], category:CATEGORIES.DIABETES, units:['mg/dL','mmol/L'], datatype:'number', description:'Glucose measurement during an oral tolerance test.' },
  { id:'hemoglobin_a1c', displayName:'Hemoglobin A1c', aliases:['HbA1c','A1c','Glycated Hemoglobin'], category:CATEGORIES.DIABETES, units:['%','mmol/mol'], datatype:'number', description:'Glycated hemoglobin measurement.' },
  { id:'estimated_average_glucose', displayName:'Estimated Average Glucose', aliases:['eAG','Average Glucose'], category:CATEGORIES.DIABETES, units:['mg/dL','mmol/L'], datatype:'number', description:'Estimated average glucose.' },
  { id:'fructosamine', displayName:'Fructosamine', aliases:['Serum Fructosamine'], category:CATEGORIES.DIABETES, units:['µmol/L'], datatype:'number', description:'Fructosamine concentration.' },
  { id:'insulin', displayName:'Insulin', aliases:['Fasting Insulin','Serum Insulin'], category:CATEGORIES.DIABETES, units:['µIU/mL','pmol/L'], datatype:'number', description:'Insulin concentration.' },
  { id:'c_peptide', displayName:'C-Peptide', aliases:['Connecting Peptide','C Peptide'], category:CATEGORIES.DIABETES, units:['ng/mL','nmol/L'], datatype:'number', description:'C-peptide concentration.' },
  { id:'homa_ir', displayName:'HOMA-IR', aliases:['Homeostatic Model Assessment Insulin Resistance'], category:CATEGORIES.DIABETES, units:['index'], datatype:'number', description:'Homeostatic model assessment index.' },
  { id:'beta_hydroxybutyrate', displayName:'Beta-Hydroxybutyrate', aliases:['BHB','3-Hydroxybutyrate'], category:CATEGORIES.DIABETES, units:['mmol/L'], datatype:'number', description:'Beta-hydroxybutyrate concentration.' },
];
