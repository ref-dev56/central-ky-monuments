/**
 * Central Kentucky Monuments – website lead form.
 *
 * Receives the Request information form from the website, checks it with
 * Cloudflare Turnstile, adds a row to the "Leads" tab and emails the
 * addresses listed on the "Settings" tab.
 *
 * Setup (once):
 *   1. Run setup() to create the Leads and Settings tabs.
 *   2. Project Settings → Script properties → add TURNSTILE_SECRET.
 *   3. Deploy → New deployment → Web app (Execute as: Me, Access: Anyone).
 *
 * This file is kept in the website repo at apps-script/Code.gs.
 */

const LEADS_SHEET = 'Leads';
const SETTINGS_SHEET = 'Settings';
const LEAD_COLUMNS = [
  'Received', 'Name', 'Phone', 'Email', 'Best way to reach', 'Design',
  'SKU', 'Cemetery', 'Timeline', 'Message', 'Page', 'Status', 'Notes',
];

/** Creates the Leads and Settings tabs. Safe to run again. */
function setup() {
  const ss = SpreadsheetApp.getActive();

  let leads = ss.getSheetByName(LEADS_SHEET);
  if (!leads) leads = ss.insertSheet(LEADS_SHEET, 0);
  leads.getRange(1, 1, 1, LEAD_COLUMNS.length).setValues([LEAD_COLUMNS]).setFontWeight('bold');
  leads.setFrozenRows(1);
  leads.getRange('A:A').setNumberFormat('m/d/yyyy h:mm am/pm');
  leads.getRange('J:J').setWrap(true);
  leads.setColumnWidth(10, 320);

  let settings = ss.getSheetByName(SETTINGS_SHEET);
  if (!settings) settings = ss.insertSheet(SETTINGS_SHEET);
  if (settings.getLastRow() === 0) {
    settings.getRange(1, 1, 3, 3).setValues([
      ['Setting', 'Value', 'Notes'],
      ['Notify emails', '', 'Who gets an email for each new request. Separate several addresses with commas.'],
      ['Email subject', 'New website request', 'The start of the email subject line.'],
    ]);
    settings.getRange('A1:C1').setFontWeight('bold');
    settings.setFrozenRows(1);
    settings.setColumnWidth(2, 320);
    settings.setColumnWidth(3, 420);
  }

  // Remove the empty default tab if it's still there.
  const blank = ss.getSheetByName('Sheet1');
  if (blank && blank.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(blank);
}

/** The website posts here. Always answers with JSON: {ok: true} or {ok: false, error}. */
function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    if (!verifyTurnstile_(data.turnstileToken)) return json_({ ok: false, error: 'verification' });

    const lead = {
      name: clean_(data.name, 120),
      phone: clean_(data.phone, 40),
      email: clean_(data.email, 200),
      contactMethod: clean_(data.contactMethod, 40),
      design: clean_(data.design, 200),
      sku: clean_(data.sku, 40),
      cemetery: clean_(data.cemetery, 200),
      timeline: clean_(data.timeline, 80),
      message: clean_(data.message, 5000),
      page: clean_(data.page, 500),
    };
    if (!lead.name || (!lead.phone && !lead.email)) return json_({ ok: false, error: 'missing' });

    saveLead_(lead);
    notify_(lead); // a failed email still keeps the row in the sheet
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server' });
  }
}

/** Visiting the web app address in a browser shows this; handy to check it's deployed. */
function doGet() {
  return json_({ ok: true, service: 'Central Kentucky Monuments lead form' });
}

/**
 * Run from the editor to test the sheet and email without the website.
 * Adds a row marked TEST and sends a test email.
 */
function sendTestLead() {
  const lead = {
    name: 'Test Person', phone: '(859) 555-0100', email: '', contactMethod: 'Phone call',
    design: 'Eternal Heart – CKM-009', sku: 'CKM-009', cemetery: 'Test Cemetery',
    timeline: 'Just exploring for now', message: 'This is a test from the Apps Script editor.',
    page: 'apps-script test',
  };
  saveLead_(lead, 'TEST');
  notify_(lead);
}

function verifyTurnstile_(token) {
  const secret = PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET');
  if (!secret) throw new Error('TURNSTILE_SECRET script property is not set');
  if (!token) return false;
  const res = UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'post',
    payload: { secret: secret, response: String(token) },
    muteHttpExceptions: true,
  });
  const body = JSON.parse(res.getContentText() || '{}');
  return body.success === true;
}

function saveLead_(lead, status) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(LEADS_SHEET);
  if (!sheet) throw new Error('Run setup() first: the Leads tab is missing');
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    sheet.appendRow([
      new Date(), lead.name, lead.phone, lead.email, lead.contactMethod, lead.design,
      lead.sku, lead.cemetery, lead.timeline, lead.message, lead.page, status || 'New', '',
    ].map(cell_));
  } finally {
    lock.releaseLock();
  }
}

function notify_(lead) {
  const to = setting_('Notify emails');
  if (!to) return;
  const subject = `${setting_('Email subject') || 'New website request'}: ${lead.name}` +
    (lead.design ? ` – ${lead.design}` : '');
  const rows = [
    ['Name', lead.name],
    ['Best way to reach', lead.contactMethod],
    ['Phone', lead.phone],
    ['Email', lead.email],
    ['Design', lead.design],
    ['Cemetery', lead.cemetery],
    ['Timeline', lead.timeline],
    ['Message', lead.message],
  ].filter(function (r) { return r[1]; });
  const text = rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n') +
    '\n\nAll requests: ' + SpreadsheetApp.getActive().getUrl();
  const html = '<table cellpadding="6" style="border-collapse:collapse;font:14px Arial,sans-serif">' +
    rows.map(function (r) {
      return '<tr><td style="color:#555;vertical-align:top">' + esc_(r[0]) + '</td><td>' +
        esc_(r[1]).replace(/\n/g, '<br>') + '</td></tr>';
    }).join('') +
    '</table><p style="font:13px Arial,sans-serif"><a href="' + SpreadsheetApp.getActive().getUrl() +
    '">Open the requests sheet</a></p>';
  const options = { htmlBody: html, name: 'Central Kentucky Monuments website' };
  if (lead.email) options.replyTo = lead.email;
  try {
    MailApp.sendEmail(to, subject, text, options);
  } catch (err) {
    console.error('Email failed', err);
  }
}

function setting_(name) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SETTINGS_SHEET);
  if (!sheet) return '';
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === name) return String(values[i][1]).trim();
  }
  return '';
}

/** Trims, shortens and strips control characters. */
function clean_(value, max) {
  return String(value == null ? '' : value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

/** Stops text that starts with = + - @ from being treated as a spreadsheet formula. */
function cell_(value) {
  return typeof value === 'string' && /^[=+\-@]/.test(value) ? "'" + value : value;
}

function esc_(s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
