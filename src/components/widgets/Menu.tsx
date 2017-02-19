import * as React from "react";
import { MenuItemProps } from "./MenuItem";
import { MenuItem } from "./MenuItem";
import { PropsBase } from "../../utilities/ComponentUtilities";

export interface MenuProps extends PropsBase {

}

export class Menu extends React.Component<MenuProps, any>{
    menuItems: MenuItemProps[] = [];
    /**
     *
     */
    constructor(props: MenuProps) {
        super(props);
        this.state = {menuItems:[]};
    }

    componentDidMount() {
        let menuItems = [];
        menuItems.push({ 
            displayName: "Menu Item 1",
            stateManager: this.props.stateManager,
            subMenuItems: [],
            action: ()=>{
                console.log("MenuItem1");
            }
        });
        menuItems.push({
            displayName: "Menu Item 2",
            stateManager: this.props.stateManager,
            action: ()=>{
                console.log("MenuItem2");
            }
        });
        menuItems.push({
            displayName: "Menu Item 3",
            stateManager: this.props.stateManager,
            action: ()=>{
                console.log("MenuItem3");
            }
        });
        this.setState({menuItems:menuItems});
    }

    render() {
        let out = [];
        this.state.menuItems.forEach((mi,i) => {
            out.push(<li onClick={()=>{mi.action()}} key={i}>{mi.displayName}</li>);
        });
        return <ul className="menu">{out}</ul>
    }
}