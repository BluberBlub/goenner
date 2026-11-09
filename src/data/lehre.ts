// Kooperierende Ausbildungsinstitute laut Altseite /Supervision-Lehre.
// Kürzel: LP Lehrpraxis, D Dozent, SV Supervisor, SE Selbsterfahrungsleiter, P Prüfer
export const rollenName: Record<string, string> = { LP: 'Lehrpraxis', D: 'Dozent', SV: 'Supervisor', SE: 'Selbsterfahrungsleiter', P: 'Prüfer' };

export const lehreGoenner = [
  { name: 'Aus- und Weiterbildungsinstitut für Verhaltenstherapie und angewandte Psychologie des Universitätsklinikums Ulm (AWIP)', rollen: ['D', 'SV'] },
  { name: 'Ausbildungszentrum für Verhaltenstherapie des Universitätsklinikums Ulm (AZVT)', rollen: ['SE'] },
  { name: 'Arbeitsgemeinschaft für VerhaltensModifikation (AVM) Bamberg', rollen: ['LP', 'SV'] },
  { name: 'Institut für Verhaltenstherapie, Verhaltensmedizin und Sexuologie Nürnberg (IVS)', rollen: ['LP', 'D', 'SV'] },
  { name: 'Zentrum für Psychotherapie Stuttgart (SZVT)', rollen: ['D', 'SV', 'P'] },
  { name: 'DGVT-Ausbildungszentrum Erlangen/Nürnberg (DGVT-E)', rollen: ['LP', 'SV'] },
  { name: 'DGVT-Ausbildungszentrum München/Bad Tölz (DGVT-M)', rollen: ['LP', 'SV'] },
  { name: 'Akademie für Psychotherapie und Interventionsforschung Potsdam (API)', rollen: ['LP', 'SV'] },
  { name: 'Bayerische Akademie für Psychotherapie München (BAP)', rollen: ['LP'] },
  { name: 'Centrum für Integrative Psychotherapie München (CIP)', rollen: ['LP'] },
  { name: 'Institut für Therapieforschung und Gesundheitsförderung München (IFT-G)', rollen: ['LP', 'SV'] },
  { name: 'DGVT-Ausbildungszentrum Bodensee/Konstanz (apb)', rollen: ['D', 'P'] },
  { name: 'Zentrum für Psychiatrie (ZfP) Südwürttemberg Weissenau', rollen: ['SV', 'SE'] },
  { name: 'SINOVA Weiterbildungsverbund für Psychosomatische Psychotherapie', rollen: ['D', 'SV'] },
  { name: 'ZIST Akademie für Psychotherapie Penzberg', rollen: ['LP'] },
];

export const lehreGoennerFrueher = [
  { name: 'C. G. Jung-Institut (CGJI) Stuttgart', rollen: ['D'], zeit: '2010–2013' },
  { name: 'Institut für Verhaltenstherapie Kurpfalz in Mannheim (IVT)', rollen: ['P'], zeit: '2010–2011' },
  { name: 'Weiterbildungsstudiengang Psychologische Psychotherapie der Universität Mainz', rollen: ['SV'], zeit: '2008–2009' },
  { name: 'Institut für Fort- und Weiterbildung in klinischer Verhaltenstherapie Bad Dürkheim (IFKV)', rollen: ['D'], zeit: '2003–2008' },
];

export const lehreMoehrle = [
  { name: 'Ausbildungszentrum für Verhaltenstherapie des Universitätsklinikums Ulm (AZVT)', rollen: ['SV'] },
  { name: 'DGVT-Ausbildungszentrum Bodensee/Konstanz (apb)', rollen: ['D'] },
  { name: 'DGVT-Ausbildungszentrum Erlangen/Nürnberg (DGVT-E)', rollen: ['SV'] },
  { name: 'Centrum für Integrative Psychotherapie München (CIP)', rollen: ['SV'] },
];
