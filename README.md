# Twitter Bot - skeleton for twitter robots

If you need to create twitter bot that will eternally iterate over own followers - this is what you need.

## Installation

Install it from npm:

```
npm install twitter_bot
```

## Usage

1. Register twitter account for your bot.
2. Register twitter application for your bot.
3. Get access tokens for your application from your bot's account.
4. Write some code
    ```javascript
    var util       = require("util"),
        TwitterBot = require("twitter_bot"),
        bot;

    // overwrite constructor
    function MyBot(config) {
        TwitterBot.call(this)
        // make something cool in constructor
        this.isCool = true;
    };

    util.inherits(MyBot, TwitterBot);

    // main function that you must implement
    MyBot.prototype.process = function(id, callback) {
        console.log("Processing user with id=" + id);
        setTimeout(callback, 1000);
    }

    // create instance of your bot
    bot = new MyBot({
        consumer_key        : "<consumer key from application settings page>",
        consumer_secret     : "<consumer secret from application settings page>",
        access_token_key    : "<auth token of your bot given to your app>",
        access_token_secret : "<auth token secret of your bot given to your app>",
        concurrency         : 10 // concurrency level, 10 is default
    });


    // start processing your followers
    bot.start();

    // after 10 seconds stop iterating new followers,
    // but finish processing current ones
    setTimeout(bot.stop.bind(bot), 10000);

    // this is it.
    ```
5. Promote yourself.

## Projects

This project came from [@listwatcher](https://twitter.com/listwatcher) ([sources](https://github.com/bobrik/ListWatcher))
code and is used in [@unfollowr](https://twitter.com/unfollowr) twitter project to manage more than 200K followers.

## Authors

* [Ian Babrou](https://github.com/bobrik)
