require('dotenv').config();
const axios = require('axios');
const lookup = require('safe-browse-url-lookup')({
  apiKey: process.env.GOOGLE_KEY
});

const Snoowrap = require('snoowrap');
const Snoostorm = require('snoostorm');

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
    subreddit: 'all',
    results: 10,
    pollTime: 5000,
};

// Create a Snoostorm CommentStream with the specified options
const comments = client.CommentStream(streamOpts);

// On comment, perform whatever logic you want to do
comments.on('comment', comment => {
    // console.log(comment.body);
    // console.log('------------')
});

lookup.checkSingle('https://google.com')
  .then(isMalicious => console.log(`isMalicious = ${isMalicious}`))
  .catch(err => console.log(err))
