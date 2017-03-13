import * as React from "react";

import { PropsBase } from "../../utilities/ComponentUtilities";
import { GoogleLoginResponse } from "../../../common/models/GoogleLoginResponse";

export interface GoogleLoginProps extends PropsBase {
    completeGoogleLogin: (args) => void;
    onLogin: () => void;
    loggedIn: boolean;
}

export interface GoogleLoginState {
    loggedIn: boolean;
}

export class GoogleLogin extends React.Component<GoogleLoginProps, GoogleLoginState> {
    completeGoogleLogin: (args) => void;

    private _googleAuth: gapi.auth2.GoogleAuth;

    constructor(props: GoogleLoginProps) {
        super(props);
        this.completeGoogleLogin = props.completeGoogleLogin;
        this.state = {
            loggedIn: false
        };
    }

    componentDidMount() {
        this._initGoogle();
    }

    private _initGoogle() {
        if (window["gapi"]) {
            gapi.load("auth2", () => {
                gapi.auth2.init({
                    client_id: "1047134015899-kpabbgk5b6bk0arj4b1hecktier9nki7.apps.googleusercontent.com"
                }).then(() => {
                    this._googleAuth = gapi.auth2.getAuthInstance();
                    this._googleAuth.isSignedIn.listen(signedIn => {
                        if (signedIn) {
                            const user: gapi.auth2.GoogleUser = this._googleAuth.currentUser.get();
                            this.completeGoogleLogin(user);
                        }
                    });
                    const loggedIn = this._googleAuth.isSignedIn.get();
                    if (loggedIn) {
                        const user: gapi.auth2.GoogleUser = this._googleAuth.currentUser.get();
                        this.completeGoogleLogin(user);
                    }
                }, (reason: string) => {
                    console.error("component:GoogleLogin:" + reason);
                });
            });
        } else {
            const interval = setInterval(() => {
                if (window["gapi"]) {
                    clearInterval(interval);
                    this._initGoogle();
                }
            }, 10);
        }
    }

    onClickLogin() {
        this._googleAuth.signIn().then(() => {
            // Don't need to do anything here, the listener above will handle it
            this.props.onLogin();
        }, (reason: string) => {
            console.error("component:GoogleLogin:" + reason);
        });
    }

    onClickLogout() {

    }

    render() {
        let displayText = "Sign in with Google";
        // If for some reason we don't have the google API, then we won't be able to sign in anyways
        if (!this._googleAuth) {
            return (
                <div className="placeHolder"></div>
            );
        }
        if (this.props.loggedIn) {
            return (
                <div id="customBtn" className="customGPlusSignIn" onClick={this.onClickLogout.bind(this)}>
                    <span className="icon"></span>
                    <span className="buttonText">Logout</span>
                </div>
            )
        } else {
            return (
                <div id="customBtn" className="customGPlusSignIn" onClick={this.onClickLogin.bind(this)}>
                    <span className="icon"></span>
                    <span className="buttonText">Google</span>
                </div>
            );
        }
    }
}