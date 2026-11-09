// Therapieteam laut Altseite /Therapeuten/Team (Stand November 2026). Reihenfolge wie dort.
// foto: Pfad ohne Endung unter /images/team/, fehlt = Initialen-Kachel (kein Foto vorhanden).
export interface Person {
  slug: string;
  name: string;
  titel: string;
  rolle: string;
  frei?: boolean;
  fachkunde?: string[];
  werdegang: string[];
  foto?: { w: number; h: number; varianten: boolean };
  links?: { label: string; href: string }[];
}

export const approbiert: Person[] = [
  {
    slug: 'goenner', name: 'Dr. Sascha Gönner', titel: 'Diplom-Psychologe', rolle: 'Psychologischer Psychotherapeut, Verhaltenstherapeut, Praxisinhaber',
    fachkunde: ['Verhaltenstherapie (Erwachsene)', 'Psychotherapie in Gruppen', 'Psychotherapie bei Kindern und Jugendlichen'],
    werdegang: [
      'Früher Leitender Psychologe der Poliklinischen Institutsambulanz für Psychotherapie der Johannes Gutenberg-Universität Mainz und Ausbildungsleiter des SZVT Zentrum für Psychotherapie Stuttgart',
      'Psychologiestudium an der Universität Koblenz-Landau',
      'Psychotherapieausbildung am Institut für Fort- und Weiterbildung in klinischer Verhaltenstherapie Bad Dürkheim',
    ],
    foto: { w: 180, h: 270, varianten: false },
    links: [
      { label: 'Publikationsliste', href: 'https://www.psychauthors.de/psychauthors/index.php?wahl=forschung&uwahl=psychauthors&uuwahl=p06955SG_pub' },
      { label: 'Bewertungen von Patienten (Jameda)', href: 'https://www.jameda.de/sascha-goenner/psychologischer-psychotherapeut/ravensburg' },
    ],
  },
  {
    slug: 'zimmermann', name: 'Gerd Zimmermann', titel: 'M.Sc. Psychologe', rolle: 'Psychologischer Psychotherapeut, Verhaltenstherapeut',
    fachkunde: ['Verhaltenstherapie (Erwachsene)', 'Psychotherapie in Gruppen', 'Übende Techniken'],
    werdegang: ['Diplom-Wirtschaftsinformatiker (DH)', 'Psychologiestudium an der Universität Konstanz', 'Psychotherapieausbildung am DGVT-Ausbildungszentrum Bodensee'],
    foto: { w: 180, h: 249, varianten: false },
  },
  {
    slug: 'fuelster', name: 'Oliver Fülster', titel: 'Diplom-Psychologe', rolle: 'Psychologischer Psychotherapeut, Verhaltenstherapeut',
    fachkunde: ['Verhaltenstherapie (Erwachsene)', 'Übende Techniken'],
    werdegang: ['Psychologiestudium an der Universität Koblenz-Landau', 'Psychotherapieausbildung am DGVT-Ausbildungszentrum Bodensee'],
    foto: { w: 1600, h: 2597, varianten: true },
  },
  {
    slug: 'komizo', name: 'Miya Sophie Komizo', titel: 'M.Sc. Psychologin', rolle: 'Psychologische Psychotherapeutin, Verhaltenstherapeutin',
    fachkunde: ['Verhaltenstherapie (Erwachsene)', 'Psychotherapie in Gruppen'],
    werdegang: ['Psychologiestudium an der Radboud University Nijmegen (NL)', 'Psychotherapieausbildung an der APV Münster'],
  },
  {
    slug: 'weber', name: 'Hannah Weber', titel: 'M.Sc. Psychologin', rolle: 'Psychologische Psychotherapeutin, Verhaltenstherapeutin',
    fachkunde: ['Verhaltenstherapie (Erwachsene)', 'Psychotherapie in Gruppen', 'Übende Verfahren'],
    werdegang: ['Psychologiestudium an der Johannes Gutenberg-Universität Mainz', 'Psychotherapieausbildung am Institut für Kognitive Verhaltenstherapie (IKVT) Wiesbaden', 'Wissenschaftliche Mitarbeiterin an der Universitätsmedizin Mainz'],
  },
  {
    slug: 'schreier', name: 'Dr. Andrea Schreier', titel: 'Diplom-Psychologin', rolle: 'Psychologische Psychotherapeutin, Verhaltenstherapeutin',
    fachkunde: ['Verhaltenstherapie (Erwachsene)', 'Übende Techniken'],
    werdegang: ['Psychologiestudium an der Eberhard Karls Universität Tübingen', 'Psychotherapieausbildung am IFT München'],
    foto: { w: 180, h: 240, varianten: false },
  },
  {
    slug: 'wunderlich', name: 'Hannah Wunderlich', titel: 'Diplom-Psychologin', rolle: 'Psychologische Psychotherapeutin, Verhaltenstherapeutin',
    fachkunde: ['Verhaltenstherapie (Erwachsene)'],
    werdegang: ['Psychologiestudium an der Otto-Friedrich-Universität Bamberg', 'Psychotherapieausbildung am Institut für Psychologische Psychotherapie und Beratung Berlin'],
    foto: { w: 180, h: 263, varianten: false },
  },
  {
    slug: 'kaltenbrunner', name: 'Andrea Kaltenbrunner', titel: 'Diplom-Psychologin', rolle: 'Psychologische Psychotherapeutin, Verhaltenstherapeutin, Psychoonkologin', frei: true,
    fachkunde: ['Verhaltenstherapie (Erwachsene)'],
    werdegang: ['Psychologiestudium an der Universität Saarbrücken', 'Psychotherapieausbildung bei der TAVT Tübingen und dem DGVT-Ausbildungszentrum Münster', 'Früher leitende Tätigkeiten in der RPK Kempten und der Hochgrat-Klinik Oberstaufen'],
    foto: { w: 1600, h: 2146, varianten: true },
  },
  {
    slug: 'moehrle', name: 'Christoph Möhrle', titel: 'Diplom-Psychologe', rolle: 'Psychologischer Psychotherapeut, Verhaltenstherapeut', frei: true,
    fachkunde: ['Verhaltenstherapie (Erwachsene)'],
    werdegang: ['Psychologiestudium an den Universitäten Trier und Freiburg', 'Psychotherapieausbildung am DGVT-Ausbildungszentrum Bodensee', 'Therapeutischer Leiter der Kinderstation im ZfP Südwürttemberg', 'Dozent und Supervisor in der staatlichen Psychotherapeutenausbildung'],
    foto: { w: 180, h: 273, varianten: false },
  },
  {
    slug: 'riempp', name: 'Claudia Riempp', titel: 'Diplom-Psychologin', rolle: 'Psychologische Psychotherapeutin, Verhaltenstherapeutin', frei: true,
    fachkunde: ['Verhaltenstherapie (Erwachsene)'],
    werdegang: ['Psychologiestudium an der Technischen Universität Berlin', 'Psychotherapieausbildung am Psychologischen Institut der TU Berlin', 'Diplom-Designerin (Studium der Kommunikation und Werbung an der Hochschule der Künste Berlin)'],
    foto: { w: 235, h: 310, varianten: false },
  },
];

export const inAusbildung: Person[] = [
  {
    slug: 'mayr', name: 'Anna Maria Mayr', titel: 'M.Sc. Psychologin', rolle: 'Psychologin in psychotherapeutischer Ausbildung',
    werdegang: ['Psychologiestudium an der Universität Regensburg', 'Psychotherapieausbildung am AVM Ulm'],
    foto: { w: 552, h: 844, varianten: false },
  },
  {
    slug: 'maier-ring', name: 'Dominik Maier-Ring', titel: 'M.Sc. Psychologe', rolle: 'Psychologe in psychotherapeutischer Ausbildung',
    werdegang: ['Psychologiestudium an der Universität Konstanz', 'Psychotherapieausbildung (TP) an der ZIST Akademie für Psychotherapie Penzberg'],
    foto: { w: 180, h: 282, varianten: false },
  },
  {
    slug: 'baumeister', name: 'Annika Baumeister', titel: 'M.Sc. Psychologin', rolle: 'Psychologin in psychotherapeutischer Ausbildung',
    werdegang: ['Psychologiestudium an der Radboud University Nijmegen und der Universität Innsbruck', 'Psychotherapieausbildung (TP) an der ZIST Akademie für Psychotherapie Penzberg'],
    foto: { w: 1600, h: 2507, varianten: true },
  },
  {
    slug: 'kloetzl', name: 'Leonie Klötzl', titel: 'M.Sc. Psychologin', rolle: 'Psychologin in psychotherapeutischer Ausbildung',
    werdegang: ['Psychologiestudium an der Universität Innsbruck', 'Psychotherapieausbildung am AVM Ulm'],
    foto: { w: 1600, h: 2689, varianten: true },
  },
];

export const initialen = (name: string) => {
  const teile = name.replace(/^Dr\.\s*/, '').split(/\s+/);
  return teile[0][0] + teile[teile.length - 1][0];
};
