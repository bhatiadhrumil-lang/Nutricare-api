import cbc from './catalog/cbc.js';
import iron from './catalog/iron.js';
import lipid from './catalog/lipid.js';
import liver from './catalog/liver.js';
import kidney from './catalog/kidney.js';
import diabetes from './catalog/diabetes.js';
import thyroid from './catalog/thyroid.js';
import vitamins from './catalog/vitamins.js';
import electrolytes from './catalog/electrolytes.js';
import hormones from './catalog/hormones.js';
import cardiac from './catalog/cardiac.js';
import inflammation from './catalog/inflammation.js';
import coagulation from './catalog/coagulation.js';
import urine from './catalog/urine.js';
import tumorMarkers from './catalog/tumorMarkers.js';

/**
 * Immutable, centralized catalog of laboratory parameters.
 * Every entry has: id, displayName, aliases, category, units, datatype, and description.
 */
export const parameterCatalog = Object.freeze([
  ...cbc, ...iron, ...lipid, ...liver, ...kidney, ...diabetes, ...thyroid,
  ...vitamins, ...electrolytes, ...hormones, ...cardiac, ...inflammation,
  ...coagulation, ...urine, ...tumorMarkers,
].map((parameter) => Object.freeze({
  ...parameter,
  aliases: Object.freeze([...parameter.aliases]),
  units: Object.freeze([...parameter.units]),
})));

/** Throws during import if an extension introduces an invalid or duplicate entry. */
function validateCatalog(catalog) {
  const ids = new Set();
  const aliases = new Set();
  const requiredFields = ['id', 'displayName', 'aliases', 'category', 'units', 'datatype', 'description'];

  for (const parameter of catalog) {
    for (const field of requiredFields) {
      if (!(field in parameter)) throw new Error(`Medical catalog entry is missing ${field}.`);
    }
    if (ids.has(parameter.id)) throw new Error(`Duplicate medical parameter id: ${parameter.id}`);
    ids.add(parameter.id);
    for (const alias of parameter.aliases) {
      const key = alias.trim().toLocaleLowerCase();
      if (aliases.has(key)) throw new Error(`Duplicate medical parameter alias: ${alias}`);
      aliases.add(key);
    }
  }
}

validateCatalog(parameterCatalog);

export default parameterCatalog;
