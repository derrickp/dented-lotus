import * as React from "react";
import { LoginLogout } from "./widgets/LoginLogout";
import { arrayToList } from "../utilities/ComponentUtilities"; 
import * as moment from "moment";
import { User } from "../../common/models/User";

export interface BannerProps {
    title: string; 
    onPageChange: (page: string) => void;
    doGoogleLogin: () => Promise<void>;
    doFacebookLogin: () => Promise<void>;
    logout: () => void;
    signUp: (type: string) => void;
    loggedIn: boolean;
    user: User;
};

export class Banner extends React.Component<BannerProps, any>{
    stateManager;
    onPageChange: (page: string) => void;
    /**
     *
     */
    constructor(props:BannerProps) {
        super(props);
        this.onPageChange = props.onPageChange;
    }
    render() {
        return <div className="banner">
            <h1>{this.props.title}</h1>
            <LoginLogout user={this.props.user} doGoogleLogin={this.props.doGoogleLogin} doFacebookLogin={this.props.doFacebookLogin} signUp={this.props.signUp} logout={this.props.logout} loggedIn={this.props.loggedIn} onPageChange={this.onPageChange} /> 
        </div>;
    }
}