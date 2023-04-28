const { google } = require('googleapis');
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URL, ACCESS_TOKEN, REFRESH_TOKEN } = process.env;

// Récupérer un client OAuth2
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

// Configuration des credentials
oauth2Client.setCredentials({ access_token: ACCESS_TOKEN, refresh_token: REFRESH_TOKEN });

// Création d'un client pour l'API Google Calendar
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

async function createEvent(title, date, length) {
  
  try {
    let endDateTime = date;

    if (length) {
      const hoursMatch = length.match(/(\d+)h/);
      const minutesMatch = length.match(/(\d+)m/);
      const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
      const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

      endDateTime = new Date(new Date(date).getTime() + hours * 60 * 60 * 1000 + minutes * 60 * 1000);
    }

    const event = {
      summary: title,
      start: {
        dateTime: date,
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'Europe/Paris',
      },
    };

    // Insertion de l'événement dans le calendrier
    calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    }, (err, res) => {
      if (err) {
        console.error('Error creating event:', err);
        return;
      }
      console.log('Event created: %s', res.data.htmlLink);
    });
    
  } catch (err) {
    console.error("Error creating event:", err);
    return null;
  }
}

module.exports = { createEvent };
