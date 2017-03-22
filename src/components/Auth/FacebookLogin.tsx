import * as React from "react";

export interface FacebookLoginProps {
    loggedIn: boolean;
    completeFacebookLogin: (args) => void;
    onLogin: () => void;
}

export interface FacebookLoginState {
    haveFacebookAuth: boolean;
}

export class FacebookLogin extends React.Component<FacebookLoginProps, FacebookLoginState> {
    constructor(props: FacebookLoginProps) {
        super(props);
        this.state = {
            haveFacebookAuth: false
        };
        this.onClickLogin = this.onClickLogin.bind(this);
        this.onClickLogout = this.onClickLogout.bind(this);
    }

    onClickLogin() {
        FB.login((response) => {
            // handle the response
            this.props.onLogin();
            this.props.completeFacebookLogin(response);
        }, { scope: 'public_profile,email' });
    }

    onClickLogout() {

    }

    componentDidMount() {
        this._initFacebook();
    }

    private _initFacebook() {
        if (window["FB"]) {
            this.setState({ haveFacebookAuth: true });
        }
        else {
            const interval = setInterval(() => {
                if (window["FB"]) {
                    clearInterval(interval);
                    this._initFacebook();
                }
            }, 100);
        }
    }

    render() {
        let displayText = "Sign in with Google";
        // If for some reason we don't have the google API, then we won't be able to sign in anyways
        if (!this.state.haveFacebookAuth) {
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