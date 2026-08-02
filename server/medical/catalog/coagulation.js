import { CATEGORIES } from '../categories.js';
/** Coagulation parameters. */
export default [
  {id:'prothrombin_time',displayName:'Prothrombin Time',aliases:['PT','Pro Time'],category:CATEGORIES.COAGULATION,units:['seconds'],datatype:'number',description:'Prothrombin clotting time.'},
  {id:'international_normalized_ratio',displayName:'International Normalized Ratio',aliases:['INR','PT INR'],category:CATEGORIES.COAGULATION,units:['ratio'],datatype:'number',description:'International normalized ratio.'},
  {id:'activated_partial_thromboplastin_time',displayName:'Activated Partial Thromboplastin Time',aliases:['aPTT','PTT','Activated PTT'],category:CATEGORIES.COAGULATION,units:['seconds'],datatype:'number',description:'Activated partial thromboplastin time.'},
  {id:'thrombin_time',displayName:'Thrombin Time',aliases:['TT','Thrombin Clotting Time'],category:CATEGORIES.COAGULATION,units:['seconds'],datatype:'number',description:'Thrombin clotting time.'},
  {id:'d_dimer',displayName:'D-Dimer',aliases:['D Dimer','Fibrin Degradation Product'],category:CATEGORIES.COAGULATION,units:['ng/mL','µg/mL FEU'],datatype:'number',description:'D-dimer concentration.'},
  {id:'fibrinogen_activity',displayName:'Fibrinogen Activity',aliases:['Functional Fibrinogen','Clauss Fibrinogen'],category:CATEGORIES.COAGULATION,units:['mg/dL','g/L'],datatype:'number',description:'Functional fibrinogen measurement.'},
  {id:'factor_viii_activity',displayName:'Factor VIII Activity',aliases:['FVIII','Factor 8'],category:CATEGORIES.COAGULATION,units:['%','IU/dL'],datatype:'number',description:'Factor VIII activity.'},
  {id:'factor_ix_activity',displayName:'Factor IX Activity',aliases:['FIX','Factor 9'],category:CATEGORIES.COAGULATION,units:['%','IU/dL'],datatype:'number',description:'Factor IX activity.'},
  {id:'von_willebrand_factor_antigen',displayName:'von Willebrand Factor Antigen',aliases:['vWF Ag','VWF Antigen'],category:CATEGORIES.COAGULATION,units:['%','IU/dL'],datatype:'number',description:'von Willebrand factor antigen measurement.'},
  {id:'antithrombin_activity',displayName:'Antithrombin Activity',aliases:['ATIII','Antithrombin III'],category:CATEGORIES.COAGULATION,units:['%','IU/dL'],datatype:'number',description:'Antithrombin activity.'},
];
