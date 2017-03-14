import * as React from "react";
import * as ReactDOM from "react-dom";

import * as moment from "moment";

import { SignupInfo } from "../../../common/models/Signup";
import { DATE_FORMAT } from "../../../common/utils/date";

export interface SignupProps {
    onSubmit: (type: string, info: SignupInfo) => Promise<boolean>;
    type: string;
}

export interface SignupState {
    email: string;
    name: string;
}

export class Signup extends React.Component<SignupProps, SignupState> {

    constructor(props: SignupProps) {
        super(props);
        this.state = {
            email: "",
            name: ""
        };
    }

    onEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ email: event.target.value });
    }

    onNameChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ name: event.target.value });
    }

    submit(event: React.MouseEvent<HTMLFormElement>) {
        if (!this._verifyEmail(this.state.email)) {
            alert("Please provide a valid email address.");
            return;
        }
        const signupInfo: SignupInfo = {
            email: this.state.email,
            requestDate: moment().format(DATE_FORMAT),
            name: this.state.name
        };
        event.preventDefault();
        this.props.onSubmit(this.props.type, signupInfo).then(success => {
            alert("Thank you for signing up. We will enable your account as soon as we can");
        }).catch((error: Error) => {
            alert(error.message);  
        });
    }

    private _verifyEmail(email: string): boolean {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    render() {
        return (
            <div className="signup-form" >
                <div className="signup-header">
                    <p>Sign Up For Dented Lotus</p>
                </div>
                <div className="signup-description">
                    <p>Dented Lotus is here for the 2017 season. If you're interested in taking part and making some picks, then sign up below to get access. Currently we only support sign-up with a Google account.</p>
                </div>
                <div className="signup-input">
                    <input type="text" className="signup-button" id="name" name="name" placeholder="NAME" value={this.state.name} onChange={this.onNameChange.bind(this)} />
                    <br />
                    <input type="email" className="signup-button" id="email" name="email" placeholder="NAME@EXAMPLE.COM" value={this.state.email} onChange={this.onEmailChange.bind(this)} />
                    <br />
                    <input type="submit" className="signup-button" id="submit" value="SIGN UP" onClick={this.submit.bind(this)} />
                </div>
            </div>
        );
    }
}