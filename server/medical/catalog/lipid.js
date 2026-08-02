import { CATEGORIES } from '../categories.js';

/** Lipid-profile parameters. */
export default [
  { id: 'total_cholesterol', displayName: 'Total Cholesterol', aliases: ['Cholesterol', 'TC'], category: CATEGORIES.LIPID, units: ['mg/dL', 'mmol/L'], datatype: 'number', description: 'Total cholesterol concentration.' },
  { id: 'hdl_cholesterol', displayName: 'HDL Cholesterol', aliases: ['HDL-C', 'High Density Lipoprotein Cholesterol'], category: CATEGORIES.LIPID, units: ['mg/dL', 'mmol/L'], datatype: 'number', description: 'High-density lipoprotein cholesterol concentration.' },
  { id: 'ldl_cholesterol', displayName: 'LDL Cholesterol', aliases: ['LDL-C', 'Low Density Lipoprotein Cholesterol'], category: CATEGORIES.LIPID, units: ['mg/dL', 'mmol/L'], datatype: 'number', description: 'Low-density lipoprotein cholesterol concentration.' },
  { id: 'triglycerides', displayName: 'Triglycerides', aliases: ['TG', 'Triacylglycerol'], category: CATEGORIES.LIPID, units: ['mg/dL', 'mmol/L'], datatype: 'number', description: 'Triglyceride concentration.' },
  { id: 'very_low_density_lipoprotein_cholesterol', displayName: 'VLDL Cholesterol', aliases: ['VLDL-C', 'Very Low Density Lipoprotein Cholesterol'], category: CATEGORIES.LIPID, units: ['mg/dL', 'mmol/L'], datatype: 'number', description: 'Very-low-density lipoprotein cholesterol concentration.' },
  { id: 'non_hdl_cholesterol', displayName: 'Non-HDL Cholesterol', aliases: ['Non HDL-C', 'Non High Density Lipoprotein Cholesterol'], category: CATEGORIES.LIPID, units: ['mg/dL', 'mmol/L'], datatype: 'number', description: 'Non-HDL cholesterol concentration.' },
  { id: 'apolipoprotein_a1', displayName: 'Apolipoprotein A1', aliases: ['Apo A1', 'ApoA-I'], category: CATEGORIES.LIPID, units: ['mg/dL', 'g/L'], datatype: 'number', description: 'Apolipoprotein A1 concentration.' },
  { id: 'apolipoprotein_b', displayName: 'Apolipoprotein B', aliases: ['Apo B', 'ApoB'], category: CATEGORIES.LIPID, units: ['mg/dL', 'g/L'], datatype: 'number', description: 'Apolipoprotein B concentration.' },
  { id: 'apolipoprotein_b_a1_ratio', displayName: 'Apolipoprotein B/A1 Ratio', aliases: ['ApoB/ApoA1 Ratio', 'Apo B:A1'], category: CATEGORIES.LIPID, units: ['ratio'], datatype: 'number', description: 'Ratio of apolipoprotein B to A1.' },
  { id: 'lipoprotein_a', displayName: 'Lipoprotein(a)', aliases: ['Lp(a)', 'LPA'], category: CATEGORIES.LIPID, units: ['mg/dL', 'nmol/L'], datatype: 'number', description: 'Lipoprotein(a) concentration.' },
  { id: 'small_dense_ldl', displayName: 'Small Dense LDL', aliases: ['sdLDL', 'Small Dense LDL Cholesterol'], category: CATEGORIES.LIPID, units: ['mg/dL', 'mmol/L'], datatype: 'number', description: 'Small dense LDL measurement.' },
  { id: 'cholesterol_hdl_ratio', displayName: 'Total Cholesterol/HDL Ratio', aliases: ['TC/HDL Ratio', 'Chol HDL Ratio'], category: CATEGORIES.LIPID, units: ['ratio'], datatype: 'number', description: 'Ratio of total cholesterol to HDL cholesterol.' },
  { id: 'ldl_hdl_ratio', displayName: 'LDL/HDL Ratio', aliases: ['LDL HDL Ratio'], category: CATEGORIES.LIPID, units: ['ratio'], datatype: 'number', description: 'Ratio of LDL cholesterol to HDL cholesterol.' },
];
