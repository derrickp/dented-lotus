"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bluebird_1 = require("bluebird");
var User_1 = require("../common/models/User");
var Race_1 = require("../common/models/Race");
var ServerUtils_1 = require("./Utilities/ServerUtils");
var StateManager = (function () {
    function StateManager() {
        this.modalVisible = false;
        this.blogs = [
            {
                author: "Craig",
                date: "Sept. 33rd",
                message: "Today shouldn't exist!",
                title: "but Why!?"
            },
            {
                author: "Derrick",
                date: "Sept. 34th",
                message: "What have we done?!",
                title: "SEPTEMBER!!!"
            }
        ];
        this.nextRace = {
            displayName: "Australian GP",
            date: "March 26, 2017"
        };
        this.currentUser = null;
        this._initGoogle();
        this._initFacebook();
    }
    Object.defineProperty(StateManager.prototype, "races", {
        get: function () {
            return Race_1.races;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateManager.prototype, "tracks", {
        get: function () {
            this._tracks = this._tracks ? this._tracks : ServerUtils_1.getAllTracks();
            return this._tracks;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateManager.prototype, "isLoggedIn", {
        get: function () {
            return this.currentUser != null;
        },
        enumerable: true,
        configurable: true
    });
    StateManager.prototype._initGoogle = function () {
        var _this = this;
        if (!window["onSignIn"]) {
            window["onSignIn"] = function (args) {
                _this.currentUser = new User_1.GoogleUser(args);
            };
        }
    };
    StateManager.prototype._initFacebook = function () {
        window.fbAsyncInit = function () {
            FB.init({
                appId: '1630122457296096',
                cookie: true,
                xfbml: true,
                version: 'v2.8'
            });
            FB.AppEvents.logPageView();
            FB.getLoginStatus(function (response) {
                if (response.status === 'connected') {
                    // Logged into your app and Facebook.
                    this.currentUser = new User_1.FacebookUser(response);
                    return;
                }
            });
        };
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id))
                return;
            js = d.createElement(s);
            js.id = id;
            js.src = "//connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v2.8";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    };
    /**
     *  Query for blog posts.
     *  returns Blog[]
     */
    StateManager.prototype.getBlogs = function (whereClause) {
        return bluebird_1.Promise.resolve(this.blogs.sort(function (a, b) { return b.date.localeCompare(a.date); }));
    };
    StateManager.prototype.getNextRace = function () {
        return bluebird_1.Promise.resolve(this.nextRace);
    };
    /**
     * Get the currently logged in user.
     */
    StateManager.prototype.getUser = function () {
        return bluebird_1.Promise.resolve(this.currentUser);
    };
    StateManager.prototype.setUser = function (user) {
        this.currentUser = user;
    };
    StateManager.prototype.signOut = function () {
        this.currentUser.logOut();
    };
    return StateManager;
}());
exports.StateManager = StateManager;
