import * as React from "react";
import { LoginLogout } from "./widgets/LoginLogout";
import { PropsBase, arrayToList } from "../utilities/ComponentUtilities";
import { Menu } from "./widgets/Menu";
import * as moment from "moment";
export interface BannerProps extends PropsBase {
    title: string;
    onMenuClicked:()=>void;
};

export class Banner extends React.Component<BannerProps, any>{
    stateManager;
    onMenuClicked:()=>void;
    /**
     *
     */
    constructor(props:BannerProps) {
        super(props);
        this.stateManager = props.stateManager;
        this.onMenuClicked = props.onMenuClicked;
    }
    render() {
        return <div className="banner">
            <h1>{this.props.title}</h1>
            <LoginLogout onLogin={this.props.stateManager.setUser.bind(this.stateManager)} onLogout={this.props.stateManager.signOut} stateManager={this.stateManager} onMenuClicked={this.onMenuClicked}/> 
        </div>;
    }
}