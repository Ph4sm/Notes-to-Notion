const { getLastEmailContent } = require('./gmail');
const { createPage, getLastDate } = require('./notion');

async function getDate() {
  global.lastDate = await getLastDate();
  //console.log(`Last date in database: ${global.lastDate}`);
}

getDate();

setInterval(async () => {
  
  const { subject, content, type, dateTime } = await getLastEmailContent();
  //console.log(`Date and time: ${dateTime}`);
  if (dateTime > global.lastDate) {
    console.log(`New mail received: ${subject}`);
    console.log(`Mail content: ${content}`);
    console.log(`Message type: ${type}`);
    console.log(`Date and time: ${dateTime}`);
    await createPage({ title: subject, content: content, type: type, dateTime: dateTime });
    global.lastDate = dateTime;

  } else {
    console.log('No new mail found.');
  }
}, 60000);

/*
async function main() {
  const lastDate = await getLastDate();
  console.log(`Last date in database: ${lastDate}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
*/
/*
async function main() {
  const { subject, content, type, dateTime } = await getLastEmailContent();
  await createPage({ title: subject, content: content, type: type, dateTime: dateTime }); 
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
*/
