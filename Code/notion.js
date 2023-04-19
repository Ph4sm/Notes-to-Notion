const { Client } = require('@notionhq/client');
const dotenv = require('dotenv');
dotenv.config();
const { createEvent } = require('./calendar');

const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

async function createPage({ title, content, type, dateTime }) {
  if (type == "Todo"){
    
    await scanContentAndCreatePages(content);
    console.log(`Page in Todo has been created!`);
    
  }else{
    
    const response = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      Name: { title: [{ text: { content: title } }] },
      Type: { select: { name: type }},
      Date: { rich_text: [{ text: { content: dateTime } }] },
    },
    "children": [{
      "object": "block", "type": "paragraph", "paragraph": { "rich_text": [{ "type": "text", "text": { "content": content }}]}
    }]
  });
  console.log(`Page "${title}" has been created!`);
    
  }
}

async function createTodo({ title, priority, dueDate }) {
  const response = await notion.pages.create({
    parent: { database_id: "917f9a34f5cc46439d3c426e06b12e74" },
    properties: {
      Name: { title: [{ text: { content: title } }] },
      Priority: { select: { name: priority }},
      Date: dueDate ? { date: { start: dueDate.toISOString().slice(0, 16) } } : undefined,
    },
  });
  console.log(`Page "${title}" has been created!`);
}

async function scanContentAndCreatePages(content) {
  const regex = /-([\s\S]*?);/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    let title = match[1].trim();
    let priority = "!!";
    let dueDate = "";
    let length = "";
    // Reconnaître une date au format JJ/MM, HHhmm
    const dateRegex = /(\d{1,2})\/(\d{1,2}),\s*(\d{1,2})h(\d{1,2})/;
    const dateMatch = title.match(dateRegex);
    if (dateMatch !== null) {
      const day = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]) - 1; // Les mois commencent à 0 dans les objets Date
      const hour = parseInt(dateMatch[3]);
      const minute = parseInt(dateMatch[4]);
      dueDate = new Date();
      dueDate.setDate(day);
      dueDate.setMonth(month);
      dueDate.setHours(hour);
      dueDate.setMinutes(minute);
      // Supprimer la date du titre
      title = title.replace(dateRegex, "").trim();
    }
    // Reconnaître une durée au format Xh ou Xm
    const lengthRegex = /,(\s*\d+\s*[hm])/i;
    const lengthMatch = title.match(lengthRegex);
    if (lengthMatch !== null) {
      length = lengthMatch[1].toLowerCase();
      title = title.replace(lengthRegex, "").trim();
    }
    if (title.includes("!!!")) {
      priority = "!!!";
    } else if (title.includes("!!")) {
      priority = "!!";
    } else if (title.includes("!")) {
      priority = "!";
    }
    console.log("Priority: " + priority);
    title = title.replace(/!/g, "");
    await createTodo({ title, priority, dueDate, length });
    
    console.log("length: " + length);
    
    if (dueDate instanceof Date && !isNaN(dueDate)) {
      const dueDateString = dueDate.toISOString().slice(0, 16) + ':00+02:00';
      console.log("dueDateString: " + dueDateString);
      let NewDueDate = new Date(dueDateString);
      await createEvent(title, NewDueDate.toISOString(), length);
    }
  }
}

async function getLastDate() {
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: "Date",
        direction: "descending"
      }
    ]
  });
  // Récupération de la date de la première page (la plus récente)
  const lastPage = response.results[0];
  const lastDate = lastPage.properties.Date.rich_text[0].text.content;
  
  return lastDate;
}

module.exports = { createPage, getLastDate };
