const { getLastEmailContent } = require('./gmail');
const { createPage } = require('./notion');


setInterval(async () => {
  const { subject, content, type, dateTime } = await getLastEmailContent();
  if (subject && content) {
    console.log(`New mail received: ${subject}`);
    console.log(`Mail content: ${content}`);
    console.log(`Message type: ${type}`);
    console.log(`Date and time: ${dateTime}`);
    await createPage({ title: subject, content: content, type: type });
  } else {
    console.log('No new mail found.');
  }
}, 10000);