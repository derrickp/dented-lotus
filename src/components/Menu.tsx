import * as React from "react";
import { PropsBase } from "../Utilities/ComponentUtilities"
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
            <a id="home" className="menu-item" href="#home" onClick={() => this.onPageChange("home")}>Home</a>
            <a id="races" className="menu-item" href="#page=all-races" onClick={() => this.onPageChange("all-races")}>Races</a>
            <a id="tracks" className="menu-item" href="#page=tracks" onClick={() => this.onPageChange("tracks")}>Tracks</a> 
        </Menu>
    }
} 