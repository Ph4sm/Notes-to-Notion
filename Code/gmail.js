const { google } = require('googleapis');
const cheerio = require('cheerio');
const { Client } = require('@notionhq/client');
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URL, ACCESS_TOKEN, REFRESH_TOKEN, NOTION_TOKEN, NOTION_DATABASE_ID } = process.env;

// initialiser Notion client
const notion = new Client({ auth: NOTION_TOKEN });

// stocker la date et l'heure du dernier mail traité
let lastEmailDateTime = null;

// fonction pour récupérer le contenu du dernier mail
async function getLastEmailContent() {
  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
  );
  oauth2Client.setCredentials({ access_token: ACCESS_TOKEN, refresh_token: REFRESH_TOKEN });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const res = await gmail.users.messages.list({ userId: 'me', maxResults: 1 });
  const message = await gmail.users.messages.get({ userId: 'me', id: res.data.messages[0].id });
  
  const headers = message.data.payload.headers;
  const subject = headers.find(header => header.name === 'Subject').value;

  // récupérer la date et l'heure du mail
  const dateHeader = headers.find(header => header.name === 'Date').value;
  const emailDateTime = new Date(dateHeader);

  // ne pas traiter le mail si la date et l'heure sont identiques au dernier mail traité
  if (lastEmailDateTime && emailDateTime.getTime() === lastEmailDateTime.getTime()) {
    console.log(`Le mail "${subject}" n'a pas été traité car il a la même date et heure que le précédent mail.`);
    return null;
  }

  // stocker la date et l'heure de ce mail pour la prochaine vérification
  lastEmailDateTime = emailDateTime;

  // récupérer le contenu du mail
  let body;
  if (message.data.payload.parts) {
    body = message.data.payload.parts.filter(part => part.mimeType === 'text/html')[0].body.data;
  } else {
    body = message.data.payload.body.data;
  }

  // déchiffrement de base64
  const decodedBody = Buffer.from(body, 'base64').toString();

  // utiliser cheerio pour extraire le contenu
  const $ = cheerio.load(decodedBody);
  let content = $('body').text();
  const startIndex = content.indexOf('##', content.indexOf('##') + 1) + 2;
  const endIndex = content.indexOf('Text transcription', startIndex);
  content = content.substring(startIndex, endIndex).trim();
  
  return { subject, content };
}

module.exports = { getLastEmailContent };