import { CATEGORIES } from '../categories.js';
/** Thyroid parameters. */
export default [
  {id:'thyroid_stimulating_hormone',displayName:'Thyroid Stimulating Hormone',aliases:['TSH','Thyrotropin'],category:CATEGORIES.THYROID,units:['mIU/L','µIU/mL'],datatype:'number',description:'Thyroid stimulating hormone concentration.'},
  {id:'free_thyroxine',displayName:'Free Thyroxine',aliases:['Free T4','FT4'],category:CATEGORIES.THYROID,units:['ng/dL','pmol/L'],datatype:'number',description:'Free thyroxine concentration.'},
  {id:'total_thyroxine',displayName:'Total Thyroxine',aliases:['Total T4','TT4','Thyroxine'],category:CATEGORIES.THYROID,units:['µg/dL','nmol/L'],datatype:'number',description:'Total thyroxine concentration.'},
  {id:'free_triiodothyronine',displayName:'Free Triiodothyronine',aliases:['Free T3','FT3'],category:CATEGORIES.THYROID,units:['pg/mL','pmol/L'],datatype:'number',description:'Free triiodothyronine concentration.'},
  {id:'total_triiodothyronine',displayName:'Total Triiodothyronine',aliases:['Total T3','TT3','Triiodothyronine'],category:CATEGORIES.THYROID,units:['ng/dL','nmol/L'],datatype:'number',description:'Total triiodothyronine concentration.'},
  {id:'thyroid_peroxidase_antibody',displayName:'Thyroid Peroxidase Antibody',aliases:['TPOAb','Anti-TPO','TPO Antibody'],category:CATEGORIES.THYROID,units:['IU/mL','kIU/L'],datatype:'number',description:'Thyroid peroxidase antibody measurement.'},
  {id:'thyroglobulin_antibody',displayName:'Thyroglobulin Antibody',aliases:['TgAb','Anti-Tg','Tg Antibody'],category:CATEGORIES.THYROID,units:['IU/mL','kIU/L'],datatype:'number',description:'Thyroglobulin antibody measurement.'},
  {id:'thyroid_stimulating_immunoglobulin',displayName:'Thyroid Stimulating Immunoglobulin',aliases:['TSI','Thyroid Receptor Antibody'],category:CATEGORIES.THYROID,units:['IU/L','index'],datatype:'number',description:'Thyroid stimulating immunoglobulin measurement.'},
  {id:'thyroglobulin',displayName:'Thyroglobulin',aliases:['Serum Thyroglobulin','Thyroglobulin Protein'],category:CATEGORIES.THYROID,units:['ng/mL','µg/L'],datatype:'number',description:'Thyroglobulin concentration.'},
];
