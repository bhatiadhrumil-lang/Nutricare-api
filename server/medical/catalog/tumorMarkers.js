import { CATEGORIES } from '../categories.js';
/** Tumor marker parameters. */
export default [
  {id:'alpha_fetoprotein',displayName:'Alpha-Fetoprotein',aliases:['AFP','Alpha Feto Protein'],category:CATEGORIES.TUMOR_MARKERS,units:['ng/mL','µg/L'],datatype:'number',description:'Alpha-fetoprotein concentration.'},
  {id:'carcinoembryonic_antigen',displayName:'Carcinoembryonic Antigen',aliases:['CEA','Carcino Embryonic Antigen'],category:CATEGORIES.TUMOR_MARKERS,units:['ng/mL','µg/L'],datatype:'number',description:'Carcinoembryonic antigen concentration.'},
  {id:'prostate_specific_antigen_total',displayName:'Total Prostate-Specific Antigen',aliases:['PSA','Total PSA'],category:CATEGORIES.TUMOR_MARKERS,units:['ng/mL','µg/L'],datatype:'number',description:'Total prostate-specific antigen concentration.'},
  {id:'prostate_specific_antigen_free',displayName:'Free Prostate-Specific Antigen',aliases:['Free PSA','fPSA'],category:CATEGORIES.TUMOR_MARKERS,units:['ng/mL','µg/L'],datatype:'number',description:'Free prostate-specific antigen concentration.'},
  {id:'cancer_antigen_125',displayName:'Cancer Antigen 125',aliases:['CA-125','CA 125'],category:CATEGORIES.TUMOR_MARKERS,units:['U/mL','kU/L'],datatype:'number',description:'Cancer antigen 125 concentration.'},
  {id:'cancer_antigen_19_9',displayName:'Cancer Antigen 19-9',aliases:['CA 19-9','CA19-9'],category:CATEGORIES.TUMOR_MARKERS,units:['U/mL','kU/L'],datatype:'number',description:'Cancer antigen 19-9 concentration.'},
  {id:'cancer_antigen_15_3',displayName:'Cancer Antigen 15-3',aliases:['CA 15-3','CA15-3'],category:CATEGORIES.TUMOR_MARKERS,units:['U/mL','kU/L'],datatype:'number',description:'Cancer antigen 15-3 concentration.'},
  {id:'human_epididymis_protein_4',displayName:'Human Epididymis Protein 4',aliases:['HE4','WFDC2'],category:CATEGORIES.TUMOR_MARKERS,units:['pmol/L'],datatype:'number',description:'Human epididymis protein 4 concentration.'},
  {id:'beta_human_chorionic_gonadotropin',displayName:'Beta Human Chorionic Gonadotropin',aliases:['β-hCG','Beta hCG','hCG'],category:CATEGORIES.TUMOR_MARKERS,units:['mIU/mL','IU/L'],datatype:'number',description:'Beta human chorionic gonadotropin concentration.'},
  {id:'calcitonin',displayName:'Calcitonin',aliases:['Serum Calcitonin'],category:CATEGORIES.TUMOR_MARKERS,units:['pg/mL','ng/L'],datatype:'number',description:'Calcitonin concentration.'},
];
