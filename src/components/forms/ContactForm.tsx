import { useEffect, useRef, useState } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Anfrage an /mailer.php, in drei kurzen Schritten (Niko 11.11.: "das ganze formular ist anstrengend.
// vllt etwas zum durchklicken? einfach machen.."). Schritt 1 und 2 sind eine Auswahl mit einem Klick
// (optional, "Weiter" mit data-weiter überspringt sie, darauf stützt sich auch der QA-Formulartest),
// Schritt 3 nur das Nötige. Versicherung und Anliegen landen in der Nachricht.

const ANLIEGEN = ['Therapieanfrage', 'Beratungs- oder Diagnostiktermin', 'Gruppentherapie', 'Supervision oder Lehrpraxis', 'Etwas anderes'] as const;
const VERSICHERUNG = [
  'AOK Baden-Württemberg mit Hausarztvertrag',
  'Betriebskrankenkasse mit BKK-Selektivvertrag',
  'Andere gesetzliche Krankenkasse',
  'Privat versichert oder Beihilfe',
  'Selbstzahler (Privatpraxis)',
] as const;

const schema = z.object({
  name: z.string().trim().min(2, 'Bitte geben Sie Ihren Namen an.'),
  email: z.string().trim().email('Bitte geben Sie eine gültige E-Mail-Adresse an.'),
  phone: z.string().trim().optional(),
  versicherung: z.string().nullish(),
  anliegen: z.string().nullish(),
  message: z.string().trim().min(10, 'Bitte schreiben Sie uns ein paar Worte mehr (mindestens 10 Zeichen).'),
  dsgvo: z.literal(true, { errorMap: () => ({ message: 'Bitte bestätigen Sie die Datenschutzerklärung.' }) }),
  website: z.string().optional(),
});
type Daten = z.infer<typeof schema>;
type Status = 'bereit' | 'sendet' | 'ok' | 'fehler';

const feld = 'w-full rounded-[10px] border border-text/15 bg-white px-3.5 py-2.5 text-[0.95rem] text-text placeholder:text-text/45 transition hover:border-text/30 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10';
const label = 'mb-1.5 block text-sm font-medium text-text';
const fehlerText = 'mt-1 text-sm font-semibold text-primary';
const wahl = 'group flex cursor-pointer items-center justify-between gap-3 rounded-[10px] border border-text/12 bg-white px-4 py-3 text-[0.95rem] text-text transition hover:border-primary/40 hover:bg-primary/[0.03] has-[:checked]:border-primary has-[:checked]:bg-primary/[0.06] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/15';
const leise = 'text-sm font-medium text-text/70 underline-offset-4 transition hover:text-primary hover:underline';
const SCHRITTE = ['Anliegen', 'Versicherung', 'Kontakt'];

const honeypot = (reg: UseFormRegisterReturn) => (
  <div className="hidden" aria-hidden="true">
    <label htmlFor="kf-website">Website</label>
    <input id="kf-website" type="text" tabIndex={-1} autoComplete="off" {...reg} />
  </div>
);

const nachricht = (d: Daten) =>
  [`Versicherungsstatus: ${d.versicherung || 'nicht angegeben'}`, d.anliegen && `Anliegen: ${d.anliegen}`, d.message].filter(Boolean).join('\n\n');

const Pfeil = () => (
  <svg className="h-4 w-4 shrink-0 text-primary opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-100 group-has-[:checked]:opacity-100" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('bereit');
  const [schritt, setSchritt] = useState(0);
  const kopf = useRef<HTMLParagraphElement>(null);
  const erster = useRef(true);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<Daten>({ resolver: zodResolver(schema) });

  // Nach jedem Schrittwechsel den Fokus auf die neue Frage (Tastatur und Screenreader), nicht beim ersten Laden
  useEffect(() => {
    if (erster.current) { erster.current = false; return; }
    kopf.current?.focus();
  }, [schritt]);

  const senden = async (d: Daten) => {
    setStatus('sendet');
    try {
      const res = await fetch('/mailer.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: d.name, email: d.email, phone: d.phone, message: nachricht(d), dsgvo: d.dsgvo, website: d.website }),
      });
      const json = await res.json().catch(() => ({ success: false }));
      if (!res.ok || !json.success) throw new Error('Senden fehlgeschlagen');
      setStatus('ok');
      reset();
      setSchritt(0);
    } catch {
      setStatus('fehler');
    }
  };

  if (status === 'ok') {
    return (
      <form onSubmit={(e) => e.preventDefault()} aria-label="Kontaktformular">
        <div role="status">
          <p className="font-display text-2xl leading-snug text-primary">Danke, Ihre Anfrage ist bei uns angekommen.</p>
          <p className="mt-3 text-[0.95rem] text-text/80">Wenn wir Ihnen ein Vorgespräch anbieten können, melden wir uns innerhalb von zwei Wochen bei Ihnen.</p>
          <button type="button" onClick={() => setStatus('bereit')} className="mt-5 text-sm font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4">Weitere Nachricht schreiben</button>
        </div>
        {honeypot(register('website'))}
      </form>
    );
  }

  const auswahl = (name: 'anliegen' | 'versicherung', werte: readonly string[]) => {
    const reg = register(name);
    return (
      <div className="grid gap-2">
        {werte.map((w) => (
          <label key={w} className={wahl}>
            <input type="radio" value={w} className="sr-only" {...reg}
              onChange={(e) => { reg.onChange(e); setTimeout(() => setSchritt((s) => s + 1), 180); }} />
            <span>{w}</span>
            <Pfeil />
          </label>
        ))}
      </div>
    );
  };
  const fragen = ['Worum geht es?', 'Wie sind Sie versichert?', 'Wie erreichen wir Sie?'];
  const hinweise = [
    'Ein Klick genügt.',
    'Das entscheidet über Wartezeit und Weg zu uns.',
    `${[watch('anliegen'), watch('versicherung')].filter(Boolean).join(' · ') || 'Fast geschafft.'}`,
  ];

  return (
    <form onSubmit={handleSubmit(senden)} noValidate aria-label="Kontaktformular">
      {/* Fortschritt */}
      <div className="flex items-center gap-3" aria-hidden="true">
        {SCHRITTE.map((s, i) => (
          <span key={s} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= schritt ? 'bg-primary' : 'bg-primary/15'}`} />
        ))}
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-text/55">Schritt {schritt + 1} von 3 · {SCHRITTE[schritt]}</p>

      <p ref={kopf} tabIndex={-1} className="mt-4 font-display text-2xl leading-snug text-primary outline-none">{fragen[schritt]}</p>
      <p className="mt-1 text-sm text-text/65">{hinweise[schritt]}</p>

      <div className="mt-6">
        {schritt === 0 && auswahl('anliegen', ANLIEGEN)}
        {schritt === 1 && auswahl('versicherung', VERSICHERUNG)}
        {schritt === 2 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="kf-name" className={label}>Name *</label>
                <input id="kf-name" type="text" autoComplete="name" className={feld} aria-invalid={!!errors.name} {...register('name')} />
                {errors.name && <p className={fehlerText} role="alert">{errors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="kf-email" className={label}>E-Mail *</label>
                <input id="kf-email" type="email" autoComplete="email" className={feld} aria-invalid={!!errors.email} {...register('email')} />
                {errors.email && <p className={fehlerText} role="alert">{errors.email.message}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="kf-phone" className={label}>Telefon <span className="font-normal text-text/55">(freiwillig)</span></label>
              <input id="kf-phone" type="tel" autoComplete="tel" className={feld} {...register('phone')} />
            </div>
            <div>
              <label htmlFor="kf-message" className={label}>Kurz zu Ihrem Anliegen *</label>
              <textarea id="kf-message" rows={4} className={feld} aria-invalid={!!errors.message}
                placeholder="Ein paar Sätze genügen. Ausführliches besprechen wir lieber persönlich."
                {...register('message')} />
              {errors.message && <p className={fehlerText} role="alert">{errors.message.message}</p>}
            </div>
            <div>
              <label className="flex cursor-pointer items-start gap-3 text-[0.8rem] leading-relaxed text-text/70">
                <input type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 rounded accent-primary" aria-invalid={!!errors.dsgvo} {...register('dsgvo')} />
                <span>Ich habe die <a href="/datenschutz/" className="font-semibold text-primary underline underline-offset-2">Datenschutzerklärung</a> gelesen und willige ein, dass meine Angaben, auch zu meiner Gesundheit, zur Bearbeitung meiner Anfrage verwendet werden. Widerruf jederzeit möglich. *</span>
              </label>
              {errors.dsgvo && <p className={fehlerText} role="alert">{errors.dsgvo.message}</p>}
            </div>
            {status === 'fehler' && (
              <p className="rounded-[10px] bg-accent/15 p-4 text-sm text-text ring-1 ring-accent/30" role="alert">
                Leider ist beim Senden ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder schreiben Sie uns an <a href="mailto:praxis@drgoenner.de" className="whitespace-nowrap font-semibold underline">praxis@drgoenner.de</a>.
              </p>
            )}
          </div>
        )}
      </div>

      {honeypot(register('website'))}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-text/10 pt-5">
        {schritt > 0
          ? <button type="button" onClick={() => setSchritt((s) => s - 1)} className={leise}>← Zurück</button>
          : <span />}
        {schritt < 2
          ? <button type="button" data-weiter onClick={() => setSchritt((s) => s + 1)} className={leise}>Überspringen →</button>
          : <button type="submit" disabled={status === 'sendet'} className="knopf knopf-voll disabled:opacity-60">
              {status === 'sendet' ? 'Wird gesendet …' : 'Anfrage senden'}
            </button>}
      </div>
    </form>
  );
}
