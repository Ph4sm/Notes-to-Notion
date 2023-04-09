const { Client } = require('@notionhq/client');
const dotenv = require('dotenv');
dotenv.config();

const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

async function createPage({ title, content }) {
  const response = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      Name: { title: [{ text: { content: title } }] },
      Description: { rich_text: [{ text: { content: content } }] },
      Type: { select: { name: "Undefined" }},    
    }
  });
  console.log(`Page "${title}" has been created!`);
}

module.exports = { createPage };
