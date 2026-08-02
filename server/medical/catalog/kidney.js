import { CATEGORIES } from '../categories.js';
/** Kidney-function parameters. */
export default [
  { id:'creatinine', displayName:'Creatinine', aliases:['Serum Creatinine','Cr'], category:CATEGORIES.KIDNEY, units:['mg/dL','µmol/L'], datatype:'number', description:'Creatinine concentration.' },
  { id:'blood_urea_nitrogen', displayName:'Blood Urea Nitrogen', aliases:['BUN','Urea Nitrogen'], category:CATEGORIES.KIDNEY, units:['mg/dL','mmol/L'], datatype:'number', description:'Urea nitrogen concentration.' },
  { id:'urea', displayName:'Urea', aliases:['Serum Urea','Blood Urea'], category:CATEGORIES.KIDNEY, units:['mg/dL','mmol/L'], datatype:'number', description:'Urea concentration.' },
  { id:'estimated_glomerular_filtration_rate', displayName:'Estimated Glomerular Filtration Rate', aliases:['eGFR','Estimated GFR'], category:CATEGORIES.KIDNEY, units:['mL/min/1.73m²'], datatype:'number', description:'Estimated glomerular filtration rate.' },
  { id:'creatinine_clearance', displayName:'Creatinine Clearance', aliases:['CrCl','Ccr'], category:CATEGORIES.KIDNEY, units:['mL/min'], datatype:'number', description:'Creatinine clearance measurement.' },
  { id:'uric_acid', displayName:'Uric Acid', aliases:['UA','Serum Urate'], category:CATEGORIES.KIDNEY, units:['mg/dL','µmol/L'], datatype:'number', description:'Uric acid concentration.' },
  { id:'cystatin_c', displayName:'Cystatin C', aliases:['CysC'], category:CATEGORIES.KIDNEY, units:['mg/L'], datatype:'number', description:'Cystatin C concentration.' },
  { id:'urine_albumin', displayName:'Urine Albumin', aliases:['Urinary Albumin','UALB'], category:CATEGORIES.KIDNEY, units:['mg/L','mg/24h'], datatype:'number', description:'Albumin measurement in urine.' },
  { id:'urine_creatinine', displayName:'Urine Creatinine', aliases:['Urinary Creatinine','UCr'], category:CATEGORIES.KIDNEY, units:['mg/dL','mmol/L'], datatype:'number', description:'Creatinine measurement in urine.' },
  { id:'albumin_creatinine_ratio', displayName:'Albumin/Creatinine Ratio', aliases:['ACR','Urine ACR','Microalbumin Creatinine Ratio'], category:CATEGORIES.KIDNEY, units:['mg/g','mg/mmol'], datatype:'number', description:'Ratio of urine albumin to creatinine.' },
  { id:'beta_2_microglobulin', displayName:'Beta-2 Microglobulin', aliases:['B2M','β2-Microglobulin'], category:CATEGORIES.KIDNEY, units:['mg/L'], datatype:'number', description:'Beta-2 microglobulin concentration.' },
  { id:'urine_protein', displayName:'Urine Protein', aliases:['Urinary Protein','Proteinuria'], category:CATEGORIES.KIDNEY, units:['mg/dL','mg/24h'], datatype:'number', description:'Protein measurement in urine.' },
  { id:'protein_creatinine_ratio', displayName:'Protein/Creatinine Ratio', aliases:['PCR','UPCR','Urine Protein Creatinine Ratio'], category:CATEGORIES.KIDNEY, units:['mg/g','mg/mmol'], datatype:'number', description:'Ratio of urine protein to creatinine.' },
];
