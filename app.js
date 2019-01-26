require('dotenv').config();
const axios = require('axios');
const Snoowrap = require('snoowrap');
const Snoostorm = require('snoostorm');
const getUrls = require('get-urls')
const lookup = require('safe-browse-url-lookup')({
  apiKey: process.env.GOOGLE_KEY
});

// Build Snoowrap and Snoostorm clients
const r = new Snoowrap({
    userAgent: 'node:google-safe-api:v0.1 (by /u/googlesafeapi)',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.REDDIT_USER,
    password: process.env.REDDIT_PASS
});

const client = new Snoostorm(r);

// Configure options for stream: subreddit & results per query
const streamOpts = {
    subreddit: 'testingground4bots',
    results: 10,
    pollTime: 10000,
};

// Create a Snoostorm CommentStream with the specified options
const comments = client.CommentStream(streamOpts);

comments.on('error', err => console.log(err))

console.log('Listening to subreddit:', `r/${streamOpts.subreddit}`)

// On comment, perform whatever logic you want to do
comments.on('comment', comment => {

  console.log(comment)

  // getUrls returns a set so we convert it to an array
  let urls = Array.from(getUrls(comment.body))

  if (urls.length) {

    // cleanup urls
    urls = urls.map(fixUrl)

    // multi check with Google Safe Browsing API
    lookup.checkMulti(urls)
    .then(urlMap => {

      for (result in urlMap) {

        console.log(`URL: ${result} is ${urlMap[result] ? 'UNSAFE' : 'SAFE'}`)

        // if link is unsafe (= true)
        if (urlMap[result]) {
          comment.reply('This link is unsafe according to the Google Safe Browsing API')
        }

        if (!result.includes('https:')) {
          console.log('this link not https')
          comment.reply('This link not https')
        }
      }
    }).catch(err => console.log(err));
  }
  // console.log('a:', a)
  // console.log('b:', b)
  // console.log(urls.length && urls)
  console.log('------------')
});


// URL CLEANING FUNCTIONS

function fixUrl(url) {
  // console.log('unfixed url:', url)
  url = removeTrailingParens(url)
  // console.log('fixed url:', url)
  return url
}

function removeTrailingParens(url) {
  while (url.slice(-1) === ')')
    url = url.slice(0, -1)
  return url
}
