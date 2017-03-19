import * as React from "react";
import {Pages} from "../components/Pages"
import { UserComponent } from "./User";
import { User } from "../../common/models/User";
import * as burger from "react-burger-menu";
import { Button, Glyphicon } from "react-bootstrap";
var Menu = burger.slide;

export interface MenuProps {
    onPageChange: (page: string) => void;
    onLogout:()=>void;
    isOpen: boolean;
    user: User;
}

export class MenuComponent extends React.Component<MenuProps, any>{
    logout:()=>void;
    /**
     *
     */
    constructor(props: MenuProps) {
        super(props);
        this.logout = props.onLogout;
    }

    componentDidMount(): void {

    }


    render(): JSX.Element | null {

        if (this.props.user.isLoggedIn && this.props.user.isAdmin) {

        }
        return <Menu customBurgerIcon={false} pageWrapId={"page-wrap"} isOpen={this.props.isOpen} right>
            <UserComponent small={true} user={this.props.user} />
            <a id="home" className="menu-item" href="#home" onClick={() => this.props.onPageChange(Pages.HOME)}>Home</a>
            <a id="races" className="menu-item" href="#page=all-races" onClick={() => this.props.onPageChange(Pages.ALL_RACES)}>Races</a>
            <a id="tracks" className="menu-item" href="#page=tracks" onClick={() => this.props.onPageChange(Pages.TRACKS)}>Tracks</a> 
            <a id="drivers" className="menu-item" href="#page=drivers" onClick={() => this.props.onPageChange(Pages.DRIVERS)}>Drivers</a> 
            <a id="logout" className="menu-item" href="#" onClick={ this.logout }>Log Out</a> 
        </Menu>;
    }
} 