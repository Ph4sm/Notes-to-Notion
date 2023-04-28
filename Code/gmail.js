const { google } = require('googleapis');
const cheerio = require('cheerio');
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URL, ACCESS_TOKEN, REFRESH_TOKEN } = process.env;

// fonction pour récupérer le contenu du dernier mail
async function getLastEmailContent() {
  
  try {
    const { OAuth2 } = google.auth;

    const oAuth2Client = new OAuth2(
      CLIENT_ID,
      CLIENT_SECRET
    );

    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const res = await gmail.users.messages.list({ userId: 'me', maxResults: 1 });
    const message = await gmail.users.messages.get({ userId: 'me', id: res.data.messages[0].id });

    const headers = message.data.payload.headers;
    const subject = headers.find(header => header.name === 'Subject').value.replace(/ 1\.pdf$/, "");

    // récupérer la date et l'heure du mail
    const dateHeader = headers.find(header => header.name === 'Date').value;

    const date = new Date(dateHeader);
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = date.getUTCFullYear().toString();
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    const seconds = date.getUTCSeconds().toString().padStart(2, "0");
    const dateTime = `${year}${month}${day}${hours}${minutes}${seconds}`;

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

    // détecter le mot clé dans le contenu
    let type = "Undefined";
      const keywordRegex = /\$\s?([a-zA-Z0-9]+)\b/;
      const match = keywordRegex.exec(content);
    if (match) {
      type = match[1].trim();
    }

    return { subject, content, type, dateTime };
    
  } catch (err) {
    console.error("Error getting Gmail data:", err);
    return null;
  }
}

module.exports = { getLastEmailContent };
