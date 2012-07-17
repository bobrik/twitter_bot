(function(module) {
    var twitter = require("ntwitter");

    function TwitterBot(config) {
        var self = this;

        self.config = {
            followers_refresh_timeout : 30000,
            followers_retry_time      : 1000,
            restart_timeout           : 1000,
            concurrency               : 10
        };

        Object.keys(config).forEach(function(key) {
            self.config[key] = config[key];
        });

        self.started             = false;
        self.current             = {};
        self.currentFollowers    = [];
        self.followers           = undefined;
        self.followersUpdateTime = 0;
        self.followersRequested  = false;
        self.followers           = [];
        self.restartTimer        = undefined;
    };

    TwitterBot.prototype.getConfig = function(key) {
        return this.config[key];
    };

    TwitterBot.prototype.getClient = function() {
        if (!this.client) {
            this.client = new twitter({
                consumer_key        : this.getConfig("consumer_key"),
                consumer_secret     : this.getConfig("consumer_secret"),
                access_token_key    : this.getConfig("access_token_key"),
                access_token_secret : this.getConfig("access_token_secret")
            });
        }

        return this.client;
    };

    TwitterBot.prototype.getFollowers = function(callback) {
        var self             = this,
            now              = new Date().getTime(),
            updateTime       = self.followersUpdateTime,
            refreshTimeout   = self.getConfig("followers_refresh_timeout"),
            alreadyRequested = self.followersRequested;

        if (alreadyRequested) {
            return setTimeout(self.getFollowers.bind(self, callback), self.getConfig("followers_retry_time"));
        }

        if (updateTime + refreshTimeout > now) {
            return callback(undefined, self.followers.slice());
        }

        self.followersRequested = true;
        self.getClient().getFollowersIds(function(error, followers) {
            self.followersRequested = false;

            if (error) {
                return callback(error);
            }

            self.followersUpdateTime = new Date().getTime();
            self.followers           = followers;

            callback(undefined, self.followers.slice());
        });
    };

    TwitterBot.prototype.start = function() {
        var self = this;

        self.started = true;

        self.getFollowers(function(error, followers) {
            self.currentFollowers = followers;
            if (error) {
                if (self.started) {
                    self.restart();
                }

                return;
            }

            var concurrency = self.getConfig("concurrency"),
                restarted   = false,
                current;

            while (Object.keys(self.current).length < concurrency && followers.length) {
                current = followers.pop();

                (function process(current) {
                    function resume() {
                        if (self.started) {
                            if (followers.length) {
                                process(followers.pop());
                            } else {
                                if (!restarted) {
                                    restarted = true;
                                    self.restart();
                                }
                            }
                        }
                    }

                    if (self.current[current]) {
                        return resume();
                    }

                    self.current[current] = true;
                    self.process(current, function processCallback() {
                        delete self.current[current];
                        resume();
                    });
                })(current);
            }
        });
    };

    TwitterBot.prototype.process = function(id, callback) {

    };

    TwitterBot.prototype.restart = function(wait) {
        var self = this;

        if (wait === undefined) {
            wait = self.getConfig("restart_timeout");
        }

        if (!self.restartTimer) {
            self.restartTimer = setTimeout(function restart() {
                self.restartTimer = undefined;
                self.start();
            }, wait);
        }
    };

    TwitterBot.prototype.stop = function() {
        this.started = false;

        if (this.restartTimer) {
            clearTimeout(this.restartTimer);
            this.restartTimer = undefined;
        }

        this.currentFollowers = [];
    };

    module.exports = TwitterBot;
})(module);
