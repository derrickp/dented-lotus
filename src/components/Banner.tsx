import * as React from "react";
import { LoginLogout } from "./widgets/LoginLogout";
import { PropsBase, arrayToList } from "../utilities/ComponentUtilities"; 
import * as moment from "moment";

export interface BannerProps extends PropsBase {
    title: string; 
    onPageChange: (page: string) => void;
    completeGoogleLogin: (args) => void;
    logout: () => void;
    loggedIn: boolean;
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
        this.stateManager = props.stateManager; 
        this.onPageChange = props.onPageChange;
        this.completeGoogleLogin = props.completeGoogleLogin;
    }
    render() {
        return <div className="banner">
            <h1>{this.props.title}</h1>
            <LoginLogout logout={this.props.logout} loggedIn={this.props.loggedIn} completeGoogleLogin={this.completeGoogleLogin} onPageChange={this.onPageChange} stateManager={this.stateManager} /> 
        </div>;
    }
}