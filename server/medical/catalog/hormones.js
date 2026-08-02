import { CATEGORIES } from '../categories.js';
/** Reproductive and endocrine hormone parameters. */
export default [
  {id:'cortisol',displayName:'Cortisol',aliases:['Serum Cortisol','Hydrocortisone'],category:CATEGORIES.HORMONES,units:['µg/dL','nmol/L'],datatype:'number',description:'Cortisol concentration.'},
  {id:'adrenocorticotropic_hormone',displayName:'Adrenocorticotropic Hormone',aliases:['ACTH','Corticotropin'],category:CATEGORIES.HORMONES,units:['pg/mL','pmol/L'],datatype:'number',description:'Adrenocorticotropic hormone concentration.'},
  {id:'dehydroepiandrosterone_sulfate',displayName:'Dehydroepiandrosterone Sulfate',aliases:['DHEA-S','DHEAS'],category:CATEGORIES.HORMONES,units:['µg/dL','µmol/L'],datatype:'number',description:'Dehydroepiandrosterone sulfate concentration.'},
  {id:'testosterone_total',displayName:'Total Testosterone',aliases:['Testosterone','Total T'],category:CATEGORIES.HORMONES,units:['ng/dL','nmol/L'],datatype:'number',description:'Total testosterone concentration.'},
  {id:'testosterone_free',displayName:'Free Testosterone',aliases:['Free T','FT'],category:CATEGORIES.HORMONES,units:['pg/mL','pmol/L'],datatype:'number',description:'Free testosterone concentration.'},
  {id:'estradiol',displayName:'Estradiol',aliases:['E2','17β-Estradiol'],category:CATEGORIES.HORMONES,units:['pg/mL','pmol/L'],datatype:'number',description:'Estradiol concentration.'},
  {id:'progesterone',displayName:'Progesterone',aliases:['P4','Serum Progesterone'],category:CATEGORIES.HORMONES,units:['ng/mL','nmol/L'],datatype:'number',description:'Progesterone concentration.'},
  {id:'luteinizing_hormone',displayName:'Luteinizing Hormone',aliases:['LH','Lutropin'],category:CATEGORIES.HORMONES,units:['mIU/mL','IU/L'],datatype:'number',description:'Luteinizing hormone concentration.'},
  {id:'follicle_stimulating_hormone',displayName:'Follicle Stimulating Hormone',aliases:['FSH','Follitropin'],category:CATEGORIES.HORMONES,units:['mIU/mL','IU/L'],datatype:'number',description:'Follicle stimulating hormone concentration.'},
  {id:'prolactin',displayName:'Prolactin',aliases:['PRL','Serum Prolactin'],category:CATEGORIES.HORMONES,units:['ng/mL','mIU/L'],datatype:'number',description:'Prolactin concentration.'},
  {id:'anti_mullerian_hormone',displayName:'Anti-Mullerian Hormone',aliases:['AMH','Mullerian Inhibiting Substance'],category:CATEGORIES.HORMONES,units:['ng/mL','pmol/L'],datatype:'number',description:'Anti-Mullerian hormone concentration.'},
  {id:'insulin_like_growth_factor_1',displayName:'Insulin-Like Growth Factor 1',aliases:['IGF-1','Somatomedin C'],category:CATEGORIES.HORMONES,units:['ng/mL','nmol/L'],datatype:'number',description:'Insulin-like growth factor 1 concentration.'},
];
