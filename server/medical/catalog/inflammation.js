import { CATEGORIES } from '../categories.js';
/** Inflammation and immune parameters. */
export default [
  {id:'c_reactive_protein',displayName:'C-Reactive Protein',aliases:['CRP','C Reactive Protein'],category:CATEGORIES.INFLAMMATION,units:['mg/L','mg/dL'],datatype:'number',description:'C-reactive protein concentration.'},
  {id:'erythrocyte_sedimentation_rate',displayName:'Erythrocyte Sedimentation Rate',aliases:['ESR','Sed Rate'],category:CATEGORIES.INFLAMMATION,units:['mm/hr'],datatype:'number',description:'Erythrocyte sedimentation rate.'},
  {id:'procalcitonin',displayName:'Procalcitonin',aliases:['PCT Procalcitonin'],category:CATEGORIES.INFLAMMATION,units:['ng/mL','µg/L'],datatype:'number',description:'Procalcitonin concentration.'},
  {id:'fibrinogen',displayName:'Fibrinogen',aliases:['Factor I','FIB'],category:CATEGORIES.INFLAMMATION,units:['mg/dL','g/L'],datatype:'number',description:'Fibrinogen concentration.'},
  {id:'interleukin_6',displayName:'Interleukin-6',aliases:['IL-6','IL6'],category:CATEGORIES.INFLAMMATION,units:['pg/mL'],datatype:'number',description:'Interleukin-6 concentration.'},
  {id:'tumor_necrosis_factor_alpha',displayName:'Tumor Necrosis Factor Alpha',aliases:['TNF-α','TNF Alpha'],category:CATEGORIES.INFLAMMATION,units:['pg/mL'],datatype:'number',description:'Tumor necrosis factor alpha concentration.'},
  {id:'rheumatoid_factor',displayName:'Rheumatoid Factor',aliases:['RF','Rheumatoid Arthritis Factor'],category:CATEGORIES.INFLAMMATION,units:['IU/mL'],datatype:'number',description:'Rheumatoid factor measurement.'},
  {id:'antinuclear_antibody',displayName:'Antinuclear Antibody',aliases:['ANA','Antinuclear Antibodies'],category:CATEGORIES.INFLAMMATION,units:['titer','index'],datatype:'number',description:'Antinuclear antibody measurement.'},
];
