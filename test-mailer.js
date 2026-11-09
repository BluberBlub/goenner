// NIKO ENDRES - MAILER TEST
// Sendet automatisch nach Deploy eine Test-Mail
// Aufruf: node test-mailer.js <live-url>

const url = process.argv[2];
if (!url) { console.error('URL fehlt'); process.exit(1); }

const mailerUrl = `${url}/mailer.php`;

const testData = {
  name:    'Niko Endres - Test',
  email:   'endres.niko@gmail.com',
  phone:   '0123456789',
  message: 'Dies ist eine automatische Test-Mail aus dem Website Autopilot. Wenn diese Mail ankommt, funktioniert das Kontaktformular korrekt.',
  dsgvo:   true,
  website: '',
};

console.log(`\n📧 Test-Mail an: ${mailerUrl}\n`);

try {
  const res = await fetch(mailerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testData),
  });
  const json = await res.json();
  if (res.ok && json.success) {
    console.log('✅ Test-Mail erfolgreich gesendet');
    console.log('   Prüfe Postfach: endres.niko@gmail.com\n');
    process.exit(0);
  } else {
    console.log(`❌ Test fehlgeschlagen: ${json.message || 'Unbekannter Fehler'}\n`);
    process.exit(1);
  }
} catch (e) {
  console.log(`❌ Verbindungsfehler: ${e.message}\n`);
  process.exit(1);
}
