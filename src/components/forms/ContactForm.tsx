import { useState } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Anfrage an /mailer.php. Versicherungsstatus entscheidet über Wartezeit und Privatpraxis (Selbstzahler),
// technisch optional (QA-Formulartest füllt keine Auswahlfelder). Zusatzfelder landen in der Nachricht.

const VERSICHERUNG = [
  'Gesetzlich: AOK Baden-Württemberg mit Hausarztvertrag',
  'Gesetzlich: Betriebskrankenkasse mit BKK-Selektivvertrag',
  'Gesetzlich: andere Krankenkasse',
  'Privat versichert oder Beihilfe',
  'Selbstzahler (Privatpraxis)',
] as const;
const ANLIEGEN = ['Therapieanfrage', 'Beratungs- oder Diagnostiktermin', 'Gruppentherapie', 'Supervision oder Lehrpraxis', 'Etwas anderes'] as const;

const schema = z.object({
  name: z.string().trim().min(2, 'Bitte geben Sie Ihren Namen an.'),
  email: z.string().trim().email('Bitte geben Sie eine gültige E-Mail-Adresse an.'),
  phone: z.string().trim().optional(),
  versicherung: z.string().optional(),
  anliegen: z.string().optional(),
  message: z.string().trim().min(10, 'Bitte schreiben Sie uns ein paar Worte mehr (mindestens 10 Zeichen).'),
  dsgvo: z.literal(true, { errorMap: () => ({ message: 'Bitte bestätigen Sie die Datenschutzerklärung.' }) }),
  website: z.string().optional(),
});
type Daten = z.infer<typeof schema>;
type Status = 'bereit' | 'sendet' | 'ok' | 'fehler';

const feld = 'w-full rounded-knopf border border-text/15 bg-white px-4 py-3.5 text-base text-text placeholder:text-text/45 transition hover:border-text/30 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10';
const label = 'mb-2 block text-[0.95rem] font-medium text-text';
const fehlerText = 'mt-1.5 text-sm font-semibold text-primary';
const chip = 'flex cursor-pointer items-center gap-3 rounded-knopf border border-text/15 bg-white px-4 py-3 text-[0.95rem] leading-snug text-text transition hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-on-primary has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/20';
const punkt = 'grid h-4 w-4 shrink-0 place-items-center rounded-full border border-current opacity-70';

const honeypot = (reg: UseFormRegisterReturn) => (
  <div className="hidden" aria-hidden="true">
    <label htmlFor="kf-website">Website</label>
    <input id="kf-website" type="text" tabIndex={-1} autoComplete="off" {...reg} />
  </div>
);

const nachricht = (d: Daten) =>
  [`Versicherungsstatus: ${d.versicherung || "nicht angegeben"}`, d.anliegen && `Anliegen: ${d.anliegen}`, d.message].filter(Boolean).join('\n\n');

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('bereit');
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Daten>({ resolver: zodResolver(schema) });

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
    } catch {
      setStatus('fehler');
    }
  };

  if (status === 'ok') {
    return (
      <form onSubmit={(e) => e.preventDefault()} aria-label="Kontaktformular">
        <div className="rounded-karte bg-primary/5 p-7 ring-1 ring-primary/10" role="status">
          <p className="font-display text-2xl text-primary sm:text-3xl">Danke, Ihre Anfrage ist bei uns angekommen.</p>
          <p className="mt-3 text-text/80">Wenn wir Ihnen ein Vorgespräch anbieten können, melden wir uns innerhalb von zwei Wochen bei Ihnen.</p>
          <button type="button" onClick={() => setStatus('bereit')} className="mt-6 font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4">Weitere Nachricht schreiben</button>
        </div>
        {honeypot(register('website'))}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(senden)} noValidate className="space-y-5" aria-label="Kontaktformular">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="kf-name" className={label}>Vor- und Nachname *</label>
          <input id="kf-name" type="text" autoComplete="name" className={feld} aria-invalid={!!errors.name} {...register('name')} />
          {errors.name && <p className={fehlerText} role="alert">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="kf-phone" className={label}>Telefon</label>
          <input id="kf-phone" type="tel" autoComplete="tel" className={feld} {...register('phone')} />
        </div>
      </div>
      <div>
        <label htmlFor="kf-email" className={label}>E-Mail *</label>
        <input id="kf-email" type="email" autoComplete="email" className={feld} aria-invalid={!!errors.email} {...register('email')} />
        {errors.email && <p className={fehlerText} role="alert">{errors.email.message}</p>}
      </div>
      <fieldset>
        <legend className={label}>Wie sind Sie versichert? <span className="font-normal text-text/60">(wichtig für die Einordnung)</span></legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {VERSICHERUNG.map((v) => (
            <label key={v} className={chip}>
              <input type="radio" value={v} className="sr-only" {...register('versicherung')} />
              <span className={punkt} aria-hidden="true" />
              <span>{v}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className={label}>Worum geht es?</legend>
        <div className="flex flex-wrap gap-2.5">
          {ANLIEGEN.map((a) => (
            <label key={a} className={chip + ' py-2.5'}>
              <input type="radio" value={a} className="sr-only" {...register('anliegen')} />
              <span>{a}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="kf-message" className={label}>Ihre Nachricht *</label>
        <textarea id="kf-message" rows={6} className={feld} aria-invalid={!!errors.message}
          placeholder="Beschreiben Sie kurz, worum es geht. Ausführliche Angaben zu Ihrer Gesundheit besprechen wir lieber persönlich."
          {...register('message')} />
        {errors.message && <p className={fehlerText} role="alert">{errors.message.message}</p>}
      </div>

      {honeypot(register('website'))}

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-text/80">
          <input type="checkbox" required className="mt-0.5 h-5 w-5 shrink-0 rounded accent-primary" aria-invalid={!!errors.dsgvo} {...register('dsgvo')} />
          <span>Ich habe die <a href="/datenschutz/" className="font-semibold text-primary underline underline-offset-2">Datenschutzerklärung</a> gelesen und willige ein, dass meine Angaben, auch zu meiner Gesundheit, zur Bearbeitung meiner Anfrage verwendet werden. Die Einwilligung kann ich jederzeit widerrufen. *</span>
        </label>
        {errors.dsgvo && <p className={fehlerText} role="alert">{errors.dsgvo.message}</p>}
      </div>

      {status === 'fehler' && (
        <p className="rounded-karte bg-accent/15 p-4 text-sm text-text ring-1 ring-accent/30" role="alert">
          Leider ist beim Senden ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder schreiben Sie uns an <a href="mailto:praxis@drgoenner.de" className="whitespace-nowrap font-semibold underline">praxis@drgoenner.de</a>.
        </p>
      )}

      <button type="submit" disabled={status === 'sendet'} className="knopf knopf-voll w-full disabled:opacity-60 sm:w-auto">
        {status === 'sendet' ? 'Wird gesendet …' : 'Anfrage senden'}
      </button>
      <p className="text-xs text-text/75">* Pflichtfelder. Unvollständige Anfragen können wir leider nicht bearbeiten.</p>
    </form>
  );
}
