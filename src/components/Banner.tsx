import * as React from "react";
import { LoginLogout } from "./widgets/LoginLogout";
import { arrayToList } from "../utilities/ComponentUtilities"; 
import * as moment from "moment";
import { User } from "../../common/models/User";

export interface BannerProps {
    title: string; 
    onPageChange: (page: string) => void;
    completeGoogleLogin: (args) => void;
    completeFacebookLogin: (args) => void;
    logout: () => void;
    signUp: (type: string) => void;
    loggedIn: boolean;
    user: User;
};

export class Banner extends React.Component<BannerProps, any>{
    stateManager;
    onPageChange: (page: string) => void;
    completeGoogleLogin: (args) => void;
    /**
     *
     */
    constructor(props:BannerProps) {
        super(props);
        this.onPageChange = props.onPageChange;
        this.completeGoogleLogin = props.completeGoogleLogin;
    }
    render() {
        return <div className="banner">
            <h1>{this.props.title}</h1>
            <LoginLogout user={this.props.user} completeFacebookLogin={this.props.completeFacebookLogin} signUp={this.props.signUp} logout={this.props.logout} loggedIn={this.props.loggedIn} completeGoogleLogin={this.completeGoogleLogin} onPageChange={this.onPageChange} /> 
        </div>;
    }
}