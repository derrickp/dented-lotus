import * as React from "react";
import { PropsBase } from "../Utilities/ComponentUtilities"
import {Pages} from "../components/Pages"
import { UserComponent } from "./User";
import * as burger from "react-burger-menu";
var Menu = burger.slide;

export interface MenuProps extends PropsBase {
    onPageChange: (page: string) => void;
    isOpen: boolean;
}

export class MenuComponent extends React.Component<MenuProps, any>{
    onPageChange: (page: string) => void;
    /**
     *
     */
    constructor(props: MenuProps) {
        super(props);
        this.onPageChange = props.onPageChange; 
        this.onPageChange.bind(this);
    }

    componentDidMount(): void {

    }


    render(): JSX.Element | null {

        if (this.props.stateManager.currentUser.isLoggedIn && this.props.stateManager.currentUser.isAdmin) {

        }
        return <Menu width={270} customBurgerIcon={false} pageWrapId={"page-wrap"} isOpen={this.props.isOpen} right>
            <UserComponent small stateManager={this.props.stateManager} />
            <a id="home" className="menu-item" href="#home" onClick={() => this.onPageChange(Pages.HOME)}>Home</a>
            <a id="races" className="menu-item" href="#page=all-races" onClick={() => this.onPageChange(Pages.ALL_RACES)}>Races</a>
            <a id="tracks" className="menu-item" href="#page=tracks" onClick={() => this.onPageChange(Pages.TRACKS)}>Tracks</a> 
            <a id="drivers" className="menu-item" href="#page=drivers" onClick={() => this.onPageChange(Pages.DRIVERS)}>Drivers</a> 
        </Menu>
    }
} 