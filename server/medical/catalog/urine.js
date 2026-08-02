import { CATEGORIES } from '../categories.js';
/** Urinalysis parameters. */
export default [
  {id:'urine_specific_gravity',displayName:'Urine Specific Gravity',aliases:['Specific Gravity','USG'],category:CATEGORIES.URINE,units:['ratio'],datatype:'number',description:'Specific gravity of urine.'},
  {id:'urine_ph',displayName:'Urine pH',aliases:['Urinary pH','UA pH'],category:CATEGORIES.URINE,units:['pH'],datatype:'number',description:'pH measurement in urine.'},
  {id:'urine_glucose',displayName:'Urine Glucose',aliases:['Urinary Glucose','Glucose Urine'],category:CATEGORIES.URINE,units:['mg/dL','mmol/L'],datatype:'number',description:'Glucose measurement in urine.'},
  {id:'urine_ketones',displayName:'Urine Ketones',aliases:['Urinary Ketones','Ketone Bodies Urine'],category:CATEGORIES.URINE,units:['mg/dL','mmol/L'],datatype:'number',description:'Ketone measurement in urine.'},
  {id:'urine_bilirubin',displayName:'Urine Bilirubin',aliases:['Urinary Bilirubin','Bilirubin Urine'],category:CATEGORIES.URINE,units:['mg/dL','µmol/L'],datatype:'number',description:'Bilirubin measurement in urine.'},
  {id:'urine_urobilinogen',displayName:'Urine Urobilinogen',aliases:['Urinary Urobilinogen','Urobilinogen Urine'],category:CATEGORIES.URINE,units:['mg/dL','µmol/L'],datatype:'number',description:'Urobilinogen measurement in urine.'},
  {id:'urine_blood',displayName:'Urine Blood',aliases:['Urinary Blood','Occult Blood Urine'],category:CATEGORIES.URINE,units:['cells/µL','RBC/HPF'],datatype:'number',description:'Blood measurement in urine.'},
  {id:'urine_leukocyte_esterase',displayName:'Urine Leukocyte Esterase',aliases:['Leukocyte Esterase','LE Urine'],category:CATEGORIES.URINE,units:['index'],datatype:'number',description:'Leukocyte esterase measurement in urine.'},
  {id:'urine_nitrite',displayName:'Urine Nitrite',aliases:['Urinary Nitrite','Nitrite Urine'],category:CATEGORIES.URINE,units:['index'],datatype:'number',description:'Nitrite measurement in urine.'},
  {id:'urine_white_blood_cells',displayName:'Urine White Blood Cells',aliases:['Urinary WBC','WBC Urine'],category:CATEGORIES.URINE,units:['cells/HPF','cells/µL'],datatype:'number',description:'White blood cell measurement in urine.'},
  {id:'urine_red_blood_cells',displayName:'Urine Red Blood Cells',aliases:['Urinary RBC','RBC Urine'],category:CATEGORIES.URINE,units:['cells/HPF','cells/µL'],datatype:'number',description:'Red blood cell measurement in urine.'},
  {id:'urine_epithelial_cells',displayName:'Urine Epithelial Cells',aliases:['Epithelial Cells Urine','Squamous Cells'],category:CATEGORIES.URINE,units:['cells/HPF'],datatype:'number',description:'Epithelial cell measurement in urine.'},
  {id:'urine_casts',displayName:'Urine Casts',aliases:['Urinary Casts','Casts Urine'],category:CATEGORIES.URINE,units:['casts/LPF'],datatype:'number',description:'Cast measurement in urine.'},
  {id:'urine_crystals',displayName:'Urine Crystals',aliases:['Urinary Crystals','Crystals Urine'],category:CATEGORIES.URINE,units:['crystals/HPF'],datatype:'number',description:'Crystal measurement in urine.'},
  {id:'urine_bacteria',displayName:'Urine Bacteria',aliases:['Urinary Bacteria','Bacteria Urine'],category:CATEGORIES.URINE,units:['bacteria/HPF'],datatype:'number',description:'Bacteria measurement in urine.'},
];
