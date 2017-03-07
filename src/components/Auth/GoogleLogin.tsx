import * as React from "react";

import { PropsBase } from "../../utilities/ComponentUtilities";
import { GoogleLoginResponse } from "../../../common/models/GoogleLoginResponse";

export interface GoogleLoginProps extends PropsBase {
    onGoogleLogin: (args) => void;
    
    loggedIn: boolean;
}

export interface GoogleLoginState {
    loggedIn: boolean;
}

export class GoogleLogin extends React.Component<GoogleLoginProps, GoogleLoginState> {
    onGoogleLogin: (args) => void;
    constructor(props: GoogleLoginProps) {
        super(props);
        this.onGoogleLogin = props.onGoogleLogin;
        this.state = {
            loggedIn: false
        };
    }

    renderGoogleButton() {
        if (window["gapi"]) {
            // gapi.signin2.render('google-sign-in', {
            //     'scope': 'profile email',
            //     'width': 240,
            //     'height': 50,
            //     'longtitle': true,
            //     'theme': 'dark',
            //     'onsuccess': (args) => {
            //         this.onSignIn(args);
            //     }
            // });
        }
    }

    onSignIn(user: GoogleLoginResponse) {
        this.onGoogleLogin(user);
    }

    render() {
        let displayText = "Sign in with Google";

        if (this.props.loggedIn) {
            return (
                <div id="google-logout"></div>
            )
        } else {
            this.renderGoogleButton();
            return (
                <div id="google-sign-in"></div>
            );
        }
    }
}