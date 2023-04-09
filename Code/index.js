const { getLastEmailContent } = require('./gmail');
const { createPage } = require('./notion');


setInterval(async () => {
  const { subject, content } = await getLastEmailContent();
  if (subject && content) {
    console.log(`New mail received: ${subject}`);
    console.log(`Mail content: ${content}`);
    await createPage({ title: subject, content: content });
  } else {
    console.log('No new mail found.');
  }
}, 10000);