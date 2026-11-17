// Listes partagées par le formulaire d'inscription (build.mjs) et le serveur (lib/manager.mjs).

// Métiers proposés : calés sur les 10 fiches de poste du site (slug = identifiant de la fiche).
export const MANAGER_ROLES = [
  ['direction-generale', 'Directeur général (CEO / DG)'],
  ['finance', 'Directeur administratif et financier (DAF / CFO)'],
  ['rh', 'Directeur des ressources humaines (DRH)'],
  ['logistique', 'Directeur logistique / supply chain'],
  ['commerce', 'Directeur commercial'],
  ['marketing', 'Directeur marketing (CMO)'],
  ['juridique', 'Directeur juridique'],
  ['rse', 'Directeur RSE'],
  ['dsi-innovation-digitale', 'DSI / Directeur de l\'innovation digitale'],
  ['operations-industrielles', 'Directeur d\'usine / des opérations industrielles'],
  ['autre', 'Autre fonction de direction'],
];

export const AVAILABILITY = [
  ['immediate', 'Immédiate'],
  ['1_month', 'Sous 1 mois'],
  ['3_months', 'Sous 3 mois'],
  ['date', 'À partir d\'une date précise'],
];

export const SECTORS = [
  'Industrie', 'Agroalimentaire', 'Distribution / Retail', 'Services B2B', 'Banque / Assurance',
  'Santé / Pharma', 'BTP / Immobilier', 'Énergie / Utilities', 'Tech / Logiciel', 'Transport / Logistique',
  'Fonds d\'investissement / Participations', 'Secteur public / Associatif',
];
