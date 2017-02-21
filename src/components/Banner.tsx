import * as React from "react";
import { LoginLogout } from "./widgets/LoginLogout";
import { PropsBase, arrayToList } from "../utilities/ComponentUtilities";
import { Menu } from "./widgets/Menu";
import * as moment from "moment";

export interface BannerProps extends PropsBase {
    title: string;
    onMenuClicked:()=>void;
    onPageChange: (page: string) => void;
    onGoogleLogin: (args) => void;
    loggedIn: boolean;
};

export class Banner extends React.Component<BannerProps, any>{
    stateManager;
    onMenuClicked:()=>void;
    onPageChange: (page: string) => void;
    onGoogleLogin: (args) => void;
    /**
     *
     */
    constructor(props:BannerProps) {
        super(props);
        this.stateManager = props.stateManager;
        this.onMenuClicked = props.onMenuClicked;
        this.onPageChange = props.onPageChange;
        this.onGoogleLogin = props.onGoogleLogin;
    }
    render() {
        return <div className="banner">
            <h1>{this.props.title}</h1>
            <LoginLogout loggedIn={this.props.loggedIn} onGoogleLogin={this.onGoogleLogin} onPageChange={this.onPageChange} onLogin={this.props.stateManager.setUser.bind(this.stateManager)} onLogout={this.props.stateManager.signOut} stateManager={this.stateManager} onMenuClicked={this.onMenuClicked}/> 
        </div>;
    }
}