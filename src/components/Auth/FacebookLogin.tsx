import * as React from "react";

export interface FacebookLoginProps {
    loggedIn: boolean;
    login: () => void;
}

export interface FacebookLoginState {
}

export class FacebookLogin extends React.Component<FacebookLoginProps, FacebookLoginState> {
    constructor(props: FacebookLoginProps) {
        super(props);
        this.state = {
        };
        this.onClickLogin = this.onClickLogin.bind(this);
        this.onClickLogout = this.onClickLogout.bind(this);
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
                    <span className="facebook-icon"></span>
                    <span className="buttonText">Logout</span>
                </div>
            )
        } else {
            return (
                <div id="customBtn" className="customGPlusSignIn" onClick={this.onClickLogin.bind(this)}>
                    <span className="facebook-icon"></span>
                    <span className="buttonText">Facebook</span>
                </div>
            );
        }
    }
}