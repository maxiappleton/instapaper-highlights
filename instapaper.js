const query = require('querystring');
const OAuth = require('mashape-oauth').OAuth;

class Instapaper {
  constructor(consumerKey, consumerSecret) {
    if (consumerKey == undefined || consumerSecret == undefined) {
      throw new Error('Must provide both consumer key and secret');
    }
    this.instapaperURL = 'https://www.instapaper.com';
    this.oAuthClient = new OAuth({
      consumerKey,
      consumerSecret,
      accessUrl: this.instapaperURL + '/api/1/oauth/access_token',
      signatureMethod: 'HMAC-SHA1',
    });
    this.accountTokenCache = {};
    this.bookmarksCache = {};

    return this;
  }

  setUserCredentials(username, password) {
    if (username == undefined || password == undefined) {
      throw new Error('Must provide both username and password');
    }
    this.username = username;
    this.password = password;
  }

  _getOAuthTokenAndSecret() {
    if (this.oAuthClient == undefined) {
      throw new Error('No OAuth client initialized');
    }

    if (this.accountTokenCache[this.username] !== undefined) {
      return Promise.resolve(this.accountTokenCache[this.username]);
    }

    return new Promise((res, rej) => {
      this.oAuthClient.getXAuthAccessToken(
        this.username,
        this.password,
        (err, oauth_token, oauth_token_secret, results) => {
          if (err) return rej(err);
          if (!oauth_token || !oauth_token_secret) {
            err = new Error('Failed to get OAuth access token');
            err.res = res;
            return reject(err);
          }
          const oauth = { token: oauth_token, secret: oauth_token_secret };
          this.accountTokenCache[this.username] = oauth;
          return res(oauth);
        }
      )
    })
  }

  async _request(endpoint, params = {}) {
    if (this.oAuthClient == undefined) {
      throw new Error('No OAuth client initialized');
    }

    const oAuthTokenAndSecret = await this._getOAuthTokenAndSecret();
    return new Promise((res, rej) => {
      const options = {
        url: this.instapaperURL + endpoint,
        oauth_token: oAuthTokenAndSecret.token,
        oauth_token_secret: oAuthTokenAndSecret.secret,
        type: 'application/x-www-form-urlencoded',
        body: query.stringify(params)
      };
      this.oAuthClient.post(options, function (err, data) {
        if (err) return rej(err);
        return res({
          data: JSON.parse(data)
        });
      })
    });
  }

  async fetchArchivedBookmarks() {
    let existingBookmarks = '';
    const bookmarkCacheIds = Object.keys(this.bookmarksCache);
    if (bookmarkCacheIds.length > 0) {
      existingBookmarks = bookmarkCacheIds.join(',');
    }
    const newBookmarks = (await this._request('/api/1/bookmarks/list',
      {
        folder_id: 'archive',
        have: existingBookmarks
      }
    ));
    newBookmarks.data.forEach(bm => {
      if (bm.bookmark_id != undefined) {
        this.bookmarksCache[bm.bookmark_id] = bm;
      }
    });
    return this.bookmarksCache;
  }

  async fetchAllHighlights() {
    const archivedBookmarkIds = Object.keys(await this.fetchArchivedBookmarks());
    const highlightRequests = archivedBookmarkIds.map(id => this._request(`/api/1.1/bookmarks/${id}/highlights`));
    const highlights = await Promise.all(highlightRequests);

    return highlights.reduce((array, highlight) => {
      const highlights = highlight.data;
      if (highlights.length > 0) {
        const bookmarkId = highlights[0].bookmark_id;
        const bookmarkAndHighlights = {
          title: this.bookmarksCache[bookmarkId].title,
          url: this.bookmarksCache[bookmarkId].url,
          highlights: highlights.map(hl => (
            {
              text: hl.text.replace(/\n/g, ''),
              time: (new Date(hl.time * 1000)).toLocaleString('en-GB')
            }
          )),
        };
        return [...array, bookmarkAndHighlights]
      }
      return [...array]
    }, []);
  }
}

module.exports = Instapaper;