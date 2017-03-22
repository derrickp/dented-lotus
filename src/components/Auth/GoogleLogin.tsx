import * as React from "react";

import { GoogleLoginResponse } from "../../../common/models/GoogleLoginResponse";

export interface GoogleLoginProps {
    completeGoogleLogin: (args) => void;
    onLogin: () => void;
    loggedIn: boolean;
}

export interface GoogleLoginState {
    haveGapi: boolean;
}

export class GoogleLogin extends React.Component<GoogleLoginProps, GoogleLoginState> {
    private _mounted: boolean = false;
    private _googleAuth: gapi.auth2.GoogleAuth;

    constructor(props: GoogleLoginProps) {
        super(props);
        this.state = {
            haveGapi: false
        };
    }

    componentDidMount() {
        this._mounted = true;
        this._initGoogle();
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    private _initGoogle() {
        if (window["gapi"]) {
            this._googleAuth = gapi.auth2.getAuthInstance();
            if (this._mounted) {
                this.setState({ haveGapi: true });
            }
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