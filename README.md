#Quick and Dirty Instapaper Highlights API Access

To get this to work, you have to:
- Clone this repo locally
- Have a working Instapaper API key
- Create a .env file in the root of the project with the following variables:
```
CONSUMER_KEY='key'
CONSUMER_SECRET='secret'
USERNAME='username'
PASSWORD='password'
```
- `npm install`
- `npm run`
- Currently returns highlights as an array grouped by bookmark, with the following info:
```
{
  title: String,
  url: String,
  highlights: [{ text: String, time: String }, ...]
}
```
(But that can easily be changed, just look at the return result of `fetchAllHighlights`)

#Instapaper API Info

- Docs available here: https://www.instapaper.com/api/full
- (Although found docs to be somewhat lacking).

Instapaper data available on each bookmark:
```
{
  hash: 'JjEd4hMY',
  description: '',
  bookmark_id: 1250679160,
  private_source: '',
  title: 'A Title',
  url: 'https://www.instapaper.com',
  progress_timestamp: 1573491773,
  time: 1573430104,
  progress: 0.840774,
  starred: '0',
  type: 'bookmark'
}
```

Instapaper data available on each highlight:
```
{
  highlight_id: 11620536,
  text: 'some text',
  note: null OR 'text',
  bookmark_id: 1250679160,
  time: 1573492221,
  position: 0,
  type: 'highlight'
}
```