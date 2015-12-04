# You Rock

A twitter-based praise webapp

http://www.yourocksite.com/

## Environment Instructions
You need a mongo DB running. For example:
```
  mongod --dbpath ./data --rest
```

Config is done through the following environment variables:

#### MONGOLAB_URI
The URI to connect to your MongoDB instance, e.g.
```
  mongodb://username:password@localhost:31628/dbname
```
(see src/TweetStore.js)

#### TWITTER_CONSUMER_KEY
#### TWITTER_CONSUMER_SECRET
#### TWITTER_ACCESS_TOKEN_KEY
#### TWITTER_ACCESS_TOKEN_SECRET
(see src/Twitter.js)

#### NEW_RELIC_LICENSE_KEY
No longer needed
(see newrelic.js)

## Run The App
```
  npm start
```

## Run The Tests

### 1. The Node Tests
```
  $ npm test
```
Or to report in junit format (e.g. for jenkins) leaving the output in the reports folder
```
  $ nodeunit --reporter junit --output reports
```

### 2. The Jasmine Tests
First make sure the client JS is browserified
```
  npm build
```

Then open spec/jasmine.html in a browser.