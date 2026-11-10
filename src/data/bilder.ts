// Bild-Register: Maße gegen CLS, Alt-Texte an einer Stelle. Varianten erzeugt npm run bilder.
// v = 800er-Varianten vorhanden, a = große AVIF/WebP vorhanden.
export const bilder = {
  'therapieraum-sessel': { w: 1600, h: 1200, v: true, a: true, alt: 'Therapieraum mit zwei Sesseln, rundem Tisch und Fischgrätparkett im Altbau' },
  'therapieraum-gruppe': { w: 1600, h: 2133, v: true, a: true, alt: 'Heller Gruppenraum mit grünen Freischwingern, Pflanzen und hohen Fenstern' },
  'therapieraum-tisch': { w: 1600, h: 2056, v: true, a: true, alt: 'Therapieraum mit Holztisch, Leselampe und Kunst an der Wand' },
  'praxis-flur': { w: 1600, h: 1477, v: true, a: true, alt: 'Flur der Praxis mit Kronleuchter, Parkett und offenen Türen zu den Behandlungsräumen' },
  'praxis-wartebereich-panorama': { w: 778, h: 384, v: false, a: true, alt: 'Wartebereich mit Sesseln, orangefarbenem Hocker und Bildern an der Wand' },
  'wartezimmer-kunst': { w: 1600, h: 2133, v: true, a: true, alt: 'Ledersessel und kleiner Tisch im Wartebereich unter einem farbigen Gemälde' },
  'kunst-frida': { w: 925, h: 1579, v: true, a: true, alt: 'Gemälde von Michaela Zollmann mit einem Frauenportrait nach Frida Kahlo neben einem Regal' },
  'kunst-ausstellung-zollmann': { w: 1600, h: 1693, v: true, a: true, alt: 'Zwei Personen stehen im Wartebereich vor einem großen Gemälde von Michaela Zollmann' },
  'kunst-spiegel': { w: 1600, h: 2356, v: true, a: true, alt: 'Großformatiges Gemälde mit Frauenfigur, daneben ein Spiegel und orangefarbene Hocker' },
  'zweig-im-licht': { w: 1600, h: 1195, v: true, a: true, alt: 'Junger Zweig mit hellgrünen Blättern im weichen Gegenlicht' },
  'fensterlicht-vertaefelung': { w: 1600, h: 1195, v: true, a: true, alt: 'Fensterlicht fällt auf eine helle Wand über alter Holzvertäfelung' },
} as const;

export type BildName = keyof typeof bilder;

export const bildSet = (name: BildName, ext: 'avif' | 'webp') => {
  const b = bilder[name];
  const gross = `/images/${name}.${ext} ${b.w}w`;
  return b.v ? `/images/${name}-800.${ext} 800w, ${gross}` : gross;
};
