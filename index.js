const Instapaper = require('./instapaper');
require('dotenv').config()

async function run() {
  if (
    !process.env.CONSUMER_KEY || !process.env.CONSUMER_SECRET ||
    !process.env.USERNAME || !process.env.PASSWORD
  ) {
    console.log('Did you forget to setup your .env file? Check the README');
    process.exit(0);
  }

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