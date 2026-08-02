import { CATEGORIES } from '../categories.js';
/** Liver-profile parameters. */
export default [
  { id:'alanine_aminotransferase', displayName:'Alanine Aminotransferase', aliases:['ALT','SGPT','Alanine Transaminase'], category:CATEGORIES.LIVER, units:['U/L'], datatype:'number', description:'Alanine aminotransferase activity.' },
  { id:'aspartate_aminotransferase', displayName:'Aspartate Aminotransferase', aliases:['AST','SGOT','Aspartate Transaminase'], category:CATEGORIES.LIVER, units:['U/L'], datatype:'number', description:'Aspartate aminotransferase activity.' },
  { id:'alkaline_phosphatase', displayName:'Alkaline Phosphatase', aliases:['ALP','Alk Phos'], category:CATEGORIES.LIVER, units:['U/L'], datatype:'number', description:'Alkaline phosphatase activity.' },
  { id:'gamma_glutamyl_transferase', displayName:'Gamma-Glutamyl Transferase', aliases:['GGT','Gamma GT','GGTP'], category:CATEGORIES.LIVER, units:['U/L'], datatype:'number', description:'Gamma-glutamyl transferase activity.' },
  { id:'lactate_dehydrogenase', displayName:'Lactate Dehydrogenase', aliases:['LDH','Lactic Dehydrogenase'], category:CATEGORIES.LIVER, units:['U/L'], datatype:'number', description:'Lactate dehydrogenase activity.' },
  { id:'total_bilirubin', displayName:'Total Bilirubin', aliases:['TBIL','Bilirubin Total'], category:CATEGORIES.LIVER, units:['mg/dL','µmol/L'], datatype:'number', description:'Total bilirubin concentration.' },
  { id:'direct_bilirubin', displayName:'Direct Bilirubin', aliases:['DBIL','Conjugated Bilirubin'], category:CATEGORIES.LIVER, units:['mg/dL','µmol/L'], datatype:'number', description:'Direct bilirubin concentration.' },
  { id:'indirect_bilirubin', displayName:'Indirect Bilirubin', aliases:['IBIL','Unconjugated Bilirubin'], category:CATEGORIES.LIVER, units:['mg/dL','µmol/L'], datatype:'number', description:'Indirect bilirubin concentration.' },
  { id:'total_protein', displayName:'Total Protein', aliases:['Serum Protein','TP'], category:CATEGORIES.LIVER, units:['g/dL','g/L'], datatype:'number', description:'Total protein concentration.' },
  { id:'albumin', displayName:'Albumin', aliases:['Serum Albumin','ALB'], category:CATEGORIES.LIVER, units:['g/dL','g/L'], datatype:'number', description:'Albumin concentration.' },
  { id:'globulin', displayName:'Globulin', aliases:['Serum Globulin','GLOB'], category:CATEGORIES.LIVER, units:['g/dL','g/L'], datatype:'number', description:'Globulin concentration.' },
  { id:'albumin_globulin_ratio', displayName:'Albumin/Globulin Ratio', aliases:['A/G Ratio','AG Ratio'], category:CATEGORIES.LIVER, units:['ratio'], datatype:'number', description:'Ratio of albumin to globulin.' },
  { id:'cholinesterase', displayName:'Cholinesterase', aliases:['CHE','Pseudocholinesterase'], category:CATEGORIES.LIVER, units:['U/L'], datatype:'number', description:'Cholinesterase activity.' },
  { id:'bile_acids', displayName:'Total Bile Acids', aliases:['TBA','Serum Bile Acids'], category:CATEGORIES.LIVER, units:['µmol/L'], datatype:'number', description:'Total bile acid concentration.' },
  { id:'ammonia', displayName:'Ammonia', aliases:['NH3','Blood Ammonia'], category:CATEGORIES.LIVER, units:['µmol/L','µg/dL'], datatype:'number', description:'Ammonia concentration.' },
];
