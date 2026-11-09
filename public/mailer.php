<?php
// NIKO ENDRES - PHP MAILER v2 (Spöri-Layout als Standard)
// Zwei Mails im Stil der Website: Anfrage an den Betrieb und Eingangsbestätigung an den Absender.
// Logo, Markenfarbe, Pflichtangaben, Links zu Website, Impressum und Datenschutz.
// v2: PHPMailer-Bundle aus public/phpmailer/ (kein Composer), vollqualifizierte Namespaces
//     (v1 hatte "use" im if-Block = 500er), Zugangsdaten nur aus .env.php, CORS nur eigene Domain,
//     Firmendaten automatisch aus site-data.json (optimize-build.js schreibt dist/mailer-daten.json).
//     Die Bestätigung enthält bewusst KEINE Kopie der Nachricht: sonst ließe sich das Formular
//     missbrauchen, um beliebige Texte über die Firmenadresse an fremde Postfächer zu schicken.
//
// Zugangsdaten: public/.env.php (nicht im Repo, per .htaccess gesperrt), Vorlage .env.php.example.
// Optional in .env.php: MAIL_TO (Empfänger, sonst kontakt.email), MAIL_FROM, SITE_URL.

$env = __DIR__ . '/.env.php';
if (file_exists($env)) require $env;

// Firmendaten aus dem Build (site-data.json)
$d = [];
$datei = __DIR__ . '/mailer-daten.json';
if (file_exists($datei)) $d = json_decode(file_get_contents($datei), true) ?: [];
$g = fn($k, $v = '') => isset($d[$k]) && $d[$k] !== '' ? $d[$k] : $v;

defined('SMTP_HOST')    || define('SMTP_HOST', '');
defined('SMTP_PORT')    || define('SMTP_PORT', 587);
defined('SMTP_USER')    || define('SMTP_USER', '');
defined('SMTP_PASS')    || define('SMTP_PASS', '');
defined('MAIL_TO')      || define('MAIL_TO', $g('email'));
defined('MAIL_FROM')    || define('MAIL_FROM', SMTP_USER ?: $g('email'));
defined('SITE_NAME')    || define('SITE_NAME', $g('firma', 'Website'));
defined('SITE_URL')     || define('SITE_URL', rtrim($g('siteUrl'), '/'));
defined('MAIL_SUBJECT') || define('MAIL_SUBJECT', 'Neue Anfrage über die Website');

$herkunft = $_SERVER['HTTP_ORIGIN'] ?? '';
$erlaubt = array_filter([SITE_URL, preg_replace('#^(https?://)#', '$1www.', SITE_URL)]);
if ($herkunft && in_array(rtrim($herkunft, '/'), $erlaubt, true)) header('Access-Control-Allow-Origin: ' . $herkunft);
header('Vary: Origin');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Methode nicht erlaubt']);
    exit;
}

// Rate-Limit: max. 5 Anfragen pro 10 Minuten und IP (nur Hash der IP und Zeitstempel)
$rlFile = sys_get_temp_dir() . '/mailer_rl_' . md5($_SERVER['REMOTE_ADDR'] ?? '');
$now = time();
$reqs = array_filter(file_exists($rlFile) ? (json_decode(file_get_contents($rlFile), true) ?: []) : [], fn($t) => $t > $now - 600);
if (count($reqs) >= 5) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Zu viele Anfragen. Bitte warten Sie einen Moment.']);
    exit;
}
$reqs[] = $now;
@file_put_contents($rlFile, json_encode(array_values($reqs)));

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
if (!empty($input['website'])) { echo json_encode(['success' => true]); exit; }   // Honeypot

function clean($s) { return htmlspecialchars(strip_tags(trim((string)($s ?? ''))), ENT_QUOTES, 'UTF-8'); }
function klartext($s) { return trim(preg_replace('/[\r\n]+/', ' ', strip_tags((string)($s ?? '')))); }
function e($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

$name    = clean(mb_substr((string)($input['name'] ?? ''), 0, 80));
$nameTxt = klartext(mb_substr((string)($input['name'] ?? ''), 0, 80));
$email   = filter_var(trim((string)($input['email'] ?? '')), FILTER_VALIDATE_EMAIL);
$phone   = clean($input['phone'] ?? '');
$message = clean($input['message'] ?? '');
$dsgvo   = !empty($input['dsgvo']);

$errors = [];
if (mb_strlen($name) < 2)     $errors[] = 'Name zu kurz';
if (preg_match('#https?://|www\.#i', $nameTxt)) $errors[] = 'Name ungültig';
if (!$email || strpbrk($email, "\"<>'") !== false) $errors[] = 'E-Mail ungültig';
if (mb_strlen($message) < 10) $errors[] = 'Nachricht zu kurz';
if (!$dsgvo)                  $errors[] = 'Datenschutz nicht bestätigt';
if ($errors) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => implode(', ', $errors)]);
    exit;
}

// ── Layout: Tabellen und Inline-Styles, damit Outlook, Gmail und Apple Mail gleich darstellen ──
$FARBE = preg_match('/^#[0-9a-f]{6}$/i', $g('farbe')) ? $g('farbe') : '#1A5C4A';
$AUF   = $g('farbeText', '#FFFFFF');            // Schrift auf der Markenfarbe (nach Kontrast)
$SERIF = $g('serif') ? "Georgia,'Times New Roman',serif" : "'Helvetica Neue',Helvetica,Arial,sans-serif";
$SANS  = "'Helvetica Neue',Helvetica,Arial,sans-serif";
$du    = $g('anrede') === 'du';
$ich   = $g('perspektive') === 'ich';
$telefon = $g('telefon');
$telHref = preg_replace('/[^\d+]/', '', $telefon);
if (strncmp($telHref, '00', 2) === 0) $telHref = '+' . substr($telHref, 2); elseif (strncmp($telHref, '0', 1) === 0) $telHref = (['AT' => '+43', 'CH' => '+41'][$g('land')] ?? '+49') . substr($telHref, 1);

function mailLayout(string $vorspann, string $titel, string $inhalt, string $hinweis = ''): string {
    global $g, $FARBE, $AUF, $SERIF, $SANS, $telefon, $telHref;
    $u = SITE_URL;
    $logo = $g('logo');
    $kopf = $logo
        ? '<a href="' . $u . '/" style="text-decoration:none;"><img src="' . e($u . $logo) . '" width="200" alt="' . e(SITE_NAME) . '" style="display:block;width:200px;max-width:100%;height:auto;border:0;"></a>'
        : '<p style="margin:0;font-family:' . $SERIF . ';font-size:22px;color:' . $FARBE . ';">' . e(SITE_NAME) . '</p>';
    $adresse = trim($g('strasse') . ' · ' . trim($g('plz') . ' ' . $g('ort')), ' ·');
    $zeilen = array_filter([
        $adresse ? e($adresse) : '',
        implode(' · ', array_filter([
            $telefon ? 'Telefon <a href="tel:' . $telHref . '" style="color:' . $AUF . ';text-decoration:none;">' . e($telefon) . '</a>' : '',
            $g('email') ? 'E-Mail <a href="mailto:' . e($g('email')) . '" style="color:' . $AUF . ';text-decoration:none;">' . e($g('email')) . '</a>' : '',
        ])),
        $g('zeiten') ? e($g('zeiten')) : '',
    ]);
    $pflicht = $g('pflichtangaben') ? '<p style="margin:0 0 14px 0;opacity:.75;">' . nl2br(e($g('pflichtangaben'))) . '</p>' : '';
    return '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    . '<meta name="color-scheme" content="light"><title>' . $titel . '</title></head>'
    . '<body style="margin:0;padding:0;background:#F2F2F1;">'
    . '<div style="display:none;max-height:0;overflow:hidden;opacity:0;">' . $vorspann . '</div>'
    . '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#F2F2F1;"><tr><td align="center" style="padding:32px 12px;">'
    . '<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#FFFFFF;border-top:4px solid ' . $FARBE . ';">'
    . '<tr><td style="padding:32px 40px 24px 40px;border-bottom:1px solid #E6E7EC;">' . $kopf . '</td></tr>'
    . '<tr><td style="padding:36px 40px 8px 40px;font-family:' . $SANS . ';font-size:15px;line-height:1.65;color:#1D2025;">'
    . '<h1 style="margin:0 0 20px 0;font-family:' . $SERIF . ';font-size:26px;line-height:1.25;font-weight:normal;color:' . $FARBE . ';">' . $titel . '</h1>'
    . $inhalt . '</td></tr>'
    . ($hinweis ? '<tr><td style="padding:16px 40px 32px 40px;font-family:' . $SANS . ';font-size:12px;line-height:1.6;color:#6B6E75;">' . $hinweis . '</td></tr>'
                : '<tr><td style="padding:16px 40px 0 40px;"></td></tr>')
    . '<tr><td style="background:' . $FARBE . ';padding:28px 40px;font-family:' . $SANS . ';font-size:12px;line-height:1.7;color:' . $AUF . ';">'
    . '<p style="margin:0 0 10px 0;font-family:' . $SERIF . ';font-size:17px;">' . e(SITE_NAME) . '</p>'
    . '<p style="margin:0 0 10px 0;opacity:.9;">' . implode('<br>', $zeilen) . '</p>'
    . $pflicht
    . ($u ? '<p style="margin:0;"><a href="' . $u . '/" style="color:' . $AUF . ';">Website</a> &nbsp;·&nbsp; '
          . '<a href="' . $u . '/impressum/" style="color:' . $AUF . ';">Impressum</a> &nbsp;·&nbsp; '
          . '<a href="' . $u . '/datenschutz/" style="color:' . $AUF . ';">Datenschutz</a></p>' : '')
    . '</td></tr></table></td></tr></table></body></html>';
}
function zeile(string $label, string $wert): string {
    return '<tr><td style="padding:10px 16px 10px 0;width:110px;vertical-align:top;font-size:13px;color:#6B6E75;border-top:1px solid #E6E7EC;">' . $label . '</td>'
         . '<td style="padding:10px 0;vertical-align:top;border-top:1px solid #E6E7EC;">' . $wert . '</td></tr>';
}

$zeit = date('d.m.Y, H:i');
$telAbs = preg_replace('/[^\d+]/', '', html_entity_decode($phone, ENT_QUOTES, 'UTF-8'));

// 1) An den Betrieb: Übersicht, Antworten per Klick
$internalHtml = mailLayout(
    'Neue Anfrage von ' . $name,
    'Neue Anfrage über die Website',
    '<p style="margin:0 0 20px 0;">Über das Kontaktformular ist eine neue Nachricht eingegangen.</p>'
    . '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size:15px;">'
    . zeile('Name', '<strong>' . $name . '</strong>')
    . zeile('E-Mail', '<a href="mailto:' . rawurlencode($email) . '" style="color:' . $FARBE . ';">' . e($email) . '</a>')
    . ($phone ? zeile('Telefon', '<a href="tel:' . $telAbs . '" style="color:' . $FARBE . ';">' . $phone . '</a>') : '')
    . zeile('Nachricht', nl2br($message))
    . zeile('Eingang', $zeit . ' Uhr')
    . zeile('Datenschutz', 'Einwilligung im Formular erteilt')
    . '</table>'
    . '<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 8px 0;"><tr><td style="background:' . $FARBE . ';">'
    . '<a href="mailto:' . rawurlencode($email) . '?subject=' . rawurlencode('Ihre Anfrage bei ' . SITE_NAME) . '" style="display:inline-block;padding:13px 26px;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:bold;color:' . $AUF . ';text-decoration:none;">Antworten</a>'
    . '</td></tr></table>'
);
$internalTxt = "Neue Anfrage über die Website\n\nName: $nameTxt\nE-Mail: $email\n" . ($phone ? 'Telefon: ' . html_entity_decode($phone, ENT_QUOTES, 'UTF-8') . "\n" : '')
    . "Nachricht:\n" . html_entity_decode($message, ENT_QUOTES, 'UTF-8') . "\n\nEingang: $zeit Uhr\nDatenschutz: Einwilligung im Formular erteilt";

// 2) Bestätigung an den Absender (Anrede und Ich/Wir aus site-data.json tonalitaet)
$hallo = $du ? 'Hallo ' . $name . ',' : 'Guten Tag ' . $name . ',';
$satz1 = $du
    ? ($ich ? 'ich habe deine Nachricht erhalten und melde mich so schnell wie möglich bei dir.' : 'wir haben deine Nachricht erhalten und melden uns so schnell wie möglich bei dir.')
    : ($ich ? 'ich habe Ihre Anfrage erhalten und melde mich so schnell wie möglich bei Ihnen.' : 'wir haben Ihre Anfrage erhalten und melden uns so schnell wie möglich bei Ihnen.');
$satz2 = $telefon ? ($du ? 'Wenn es eilt, erreichst du ' . ($ich ? 'mich' : 'uns') . ' direkt unter ' : 'Wenn es eilt, erreichen Sie ' . ($ich ? 'mich' : 'uns') . ' direkt unter ') : '';
$gruss = $ich ? ($g('inhaber') ?: SITE_NAME) : 'Ihr Team von ' . SITE_NAME;
if ($du && !$ich) $gruss = 'Dein Team von ' . SITE_NAME;
$domain = preg_replace('#^https?://#', '', SITE_URL);
$confirmHtml = mailLayout(
    $du ? 'Danke, deine Nachricht ist angekommen.' : 'Vielen Dank, Ihre Nachricht ist angekommen.',
    $du ? 'Danke für deine Nachricht.' : 'Vielen Dank für Ihre Nachricht.',
    '<p style="margin:0 0 16px 0;">' . $hallo . '</p>'
    . '<p style="margin:0 0 16px 0;">' . $satz1 . '</p>'
    . ($satz2 ? '<p style="margin:0 0 16px 0;">' . $satz2 . '<a href="tel:' . $telHref . '" style="color:' . $FARBE . ';font-weight:bold;">' . e($telefon) . '</a>.</p>' : '')
    . '<p style="margin:24px 0 0 0;">' . ($du ? 'Viele Grüße' : 'Mit freundlichen Grüßen') . '<br><span style="font-family:' . $SERIF . ';font-size:18px;color:' . $FARBE . ';">' . e($gruss) . '</span></p>',
    'Diese E-Mail wurde automatisch versendet, weil über das Kontaktformular auf ' . e($domain)
    . ' eine Anfrage mit dieser Adresse gestellt wurde. Falls ' . ($du ? 'du das nicht warst, kannst du' : 'Sie das nicht waren, können Sie') . ' diese E-Mail ignorieren. '
    . ($du ? 'Wie wir deine Angaben verarbeiten, steht in der ' : 'Wie wir Ihre Angaben verarbeiten, lesen Sie in der ')
    . '<a href="' . SITE_URL . '/datenschutz/" style="color:#6B6E75;">Datenschutzerklärung</a>.'
);
$confirmTxt = ($du ? "Hallo $nameTxt,\n\n" : "Guten Tag $nameTxt,\n\n") . $satz1 . "\n"
    . ($satz2 ? $satz2 . $telefon . ".\n" : '') . "\n" . ($du ? 'Viele Grüße' : 'Mit freundlichen Grüßen') . "\n$gruss\n\n--\n" . SITE_NAME . "\n"
    . ($g('strasse') ? $g('strasse') . ', ' . trim($g('plz') . ' ' . $g('ort')) . "\n" : '')
    . (SITE_URL ? 'Impressum: ' . SITE_URL . "/impressum/\nDatenschutz: " . SITE_URL . "/datenschutz/\n" : '');
$betreffBestaetigung = ($du ? 'Deine Anfrage bei ' : 'Ihre Anfrage bei ') . SITE_NAME;

$sent = false;
$bundle = __DIR__ . '/phpmailer/PHPMailer.php';
if (SMTP_HOST && file_exists($bundle)) {
    require_once __DIR__ . '/phpmailer/Exception.php';
    require_once __DIR__ . '/phpmailer/PHPMailer.php';
    require_once __DIR__ . '/phpmailer/SMTP.php';
    $send = function ($to, $subj, $html, $txt, $replyTo = null) {
        $m = new \PHPMailer\PHPMailer\PHPMailer(true);
        $m->isSMTP();
        $m->Host       = SMTP_HOST;
        $m->SMTPAuth   = true;
        $m->Username   = SMTP_USER;
        $m->Password   = SMTP_PASS;
        $m->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $m->Port       = SMTP_PORT;
        $m->CharSet    = 'UTF-8';
        $m->Timeout    = 15;
        $m->setFrom(MAIL_FROM, SITE_NAME);
        $m->addAddress($to);
        if ($replyTo) $m->addReplyTo($replyTo);
        $m->isHTML(true);
        $m->Subject = $subj;
        $m->Body    = $html;
        $m->AltBody = $txt;
        $m->send();
    };
    try {
        $send(MAIL_TO, MAIL_SUBJECT . ': ' . $nameTxt, $internalHtml, $internalTxt, $email);
        $sent = true;
        try { $send($email, $betreffBestaetigung, $confirmHtml, $confirmTxt); } catch (\Throwable $e) { }
    } catch (\Throwable $e) {
        error_log('mailer.php SMTP: ' . $e->getMessage());
    }
}

// Fallback: natives mail() (manche Shared-Hosts blocken externes SMTP)
if (!$sent && MAIL_TO) {
    $enc = fn($s) => '=?UTF-8?B?' . base64_encode($s) . '?=';
    $headers = "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n"
        . 'From: ' . $enc(SITE_NAME) . ' <' . MAIL_FROM . ">\r\nReply-To: $email\r\n";
    $sent = mail(MAIL_TO, $enc(MAIL_SUBJECT . ': ' . $nameTxt), $internalTxt, $headers);
    if ($sent) {
        $ch = "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nFrom: " . $enc(SITE_NAME) . ' <' . MAIL_FROM . ">\r\n";
        @mail($email, $enc($betreffBestaetigung), $confirmTxt, $ch);
    }
}

if ($sent) {
    echo json_encode(['success' => true, 'message' => 'Nachricht erfolgreich gesendet']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Fehler beim Senden. Bitte später erneut versuchen oder anrufen.']);
}
