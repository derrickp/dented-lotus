import * as React from "react";

import { GoogleLoginResponse } from "../../../common/models/GoogleLoginResponse";

export interface GoogleLoginProps {
    login: () => void;
    loggedIn: boolean;
}

export interface GoogleLoginState {
}

export class GoogleLogin extends React.Component<GoogleLoginProps, GoogleLoginState> {

    constructor(props: GoogleLoginProps) {
        super(props);
        this.state = {
            haveGapi: false
        };
    }

    onClickLogin() {
        this.props.login();
    }

    onClickLogout() {

    }

    render() {
        let displayText = "Sign in with Google";
        // If for some reason we don't have the google API, then we won't be able to sign in anyways
        if (!this.props.login) {
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