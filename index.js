const Instapaper = require('./instapaper');
require('dotenv').config()

async function run() {
  try {
    const client = new Instapaper(process.env.CONSUMER_KEY, process.env.CONSUMER_SECRET);
    client.setUserCredentials(process.env.USERNAME, process.env.PASSWORD)
    const highlights = await client.fetchAllHighlights();
    /* 
      Do whatever you want with the highlights from here.
      E.g. convert to markdown file and create a local file using `fsPromises.writeFile()`
    */
    console.log(highlights[0]);
  } catch (err) {
    console.log('Errored', err);
  }
}

run();