
import { Blog } from "./models/Blog";

import { Promise } from "bluebird";
import { User, GoogleUser, FacebookUser } from "./models/User";
import { Race, races } from "./models/Race";

declare var FB: FBSDK;
export class StateManager {
    modalVisible = false;
    blogs: Blog[] = [
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

    nextRace = {
        displayName: "Australian GP",
        date: "March 26, 2017"
    };

    get races() {
        return races;
    }

    currentUser: User = new User();

    constructor() {
        this._initGoogle();
        this._initFacebook();
    }

    private _initGoogle() {
        if (!window["onSignIn"]) {
            window["onSignIn"] = (args) => {
                this.currentUser = new GoogleUser(args);
            }
        }
    }

    private _initFacebook() {
        (<any>window).fbAsyncInit = function () {
            FB.init({
                appId: '1630122457296096',
                cookie: true,
                xfbml: true,
                version: 'v2.8'
            });

            (<any>FB).AppEvents.logPageView();
            FB.getLoginStatus(function (response) {
                if (response.status === 'connected') {
                    // Logged into your app and Facebook.
                    this.currentUser = new FacebookUser(response);
                    return;
                }  
            });
        };
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v2.8";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }

    /**
     *  Query for blog posts.
     *  returns Blog[]
     */
    getBlogs(whereClause?: string): Promise<Blog[]> {
        return Promise.resolve(this.blogs.sort((a: Blog, b: Blog) => { return b.date.localeCompare(a.date) }));
    }


    getNextRace(): Promise<{}> {
        return Promise.resolve(this.nextRace);
    }
    /**
     * Get the currently logged in user.    
     */
    getUser(): Promise<User> {
        return Promise.resolve(this.currentUser);
    }

    setUser(user:User): void{
        this.currentUser = user;
    }

    signOut():void{
        this.currentUser.logOut();
    }
}