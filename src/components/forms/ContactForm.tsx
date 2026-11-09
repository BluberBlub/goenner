import { useState } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Anfrage an /mailer.php. Versicherungsstatus ist Pflicht (Altseite: unvollständige Anfragen werden nicht
// bearbeitet; Selbstzahler melden sich in der Privatpraxis an). Zusatzfelder landen in der Nachricht.

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
  versicherung: z.string().min(1, 'Bitte wählen Sie Ihren Versicherungsstatus.'),
  anliegen: z.string().optional(),
  message: z.string().trim().min(10, 'Bitte schreiben Sie uns ein paar Worte mehr (mindestens 10 Zeichen).'),
  dsgvo: z.literal(true, { errorMap: () => ({ message: 'Bitte bestätigen Sie die Datenschutzerklärung.' }) }),
  website: z.string().optional(),
});
type Daten = z.infer<typeof schema>;
type Status = 'bereit' | 'sendet' | 'ok' | 'fehler';

const feld = 'w-full rounded-karte border border-primary/25 bg-background px-4 py-3.5 text-base text-text placeholder:text-text/45 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15';
const label = 'mb-1.5 block text-sm font-semibold text-primary';
const fehlerText = 'mt-1.5 text-sm font-semibold text-primary';

const honeypot = (reg: UseFormRegisterReturn) => (
  <div className="hidden" aria-hidden="true">
    <label htmlFor="kf-website">Website</label>
    <input id="kf-website" type="text" tabIndex={-1} autoComplete="off" {...reg} />
  </div>
);

const nachricht = (d: Daten) =>
  [`Versicherungsstatus: ${d.versicherung}`, d.anliegen && `Anliegen: ${d.anliegen}`, d.message].filter(Boolean).join('\n\n');

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
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="kf-versicherung" className={label}>Versicherungsstatus *</label>
          <select id="kf-versicherung" className={feld} defaultValue="" aria-invalid={!!errors.versicherung} {...register('versicherung')}>
            <option value="">Bitte wählen</option>
            {VERSICHERUNG.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          {errors.versicherung && <p className={fehlerText} role="alert">{errors.versicherung.message}</p>}
        </div>
        <div>
          <label htmlFor="kf-anliegen" className={label}>Worum geht es?</label>
          <select id="kf-anliegen" className={feld} defaultValue="" {...register('anliegen')}>
            <option value="">Bitte wählen</option>
            {ANLIEGEN.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>
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
          <input type="checkbox" required className="mt-0.5 h-5 w-5 shrink-0 accent-primary" aria-invalid={!!errors.dsgvo} {...register('dsgvo')} />
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
