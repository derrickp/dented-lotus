import * as React from "react";
import { PropsBase } from "../../utilities/ComponentUtilities";
export interface MenuItemProps extends PropsBase {
    displayName: string;
    subMenuItems?: MenuItem[];
    action?:()=>any;
}

export class MenuItem extends React.Component<MenuItemProps, any>{
    /**
     *  
     */
    constructor(props: MenuItemProps) {
        super(props);

    }

    componentDidMount() {

    }

    render() {
        if (this.props.subMenuItems && this.props.subMenuItems.length > 0) {
            let subItems = [];
            this.props.subMenuItems.forEach((mi:MenuItem)=>{
                subItems.push(mi.render())
            });
            return <ul>{subItems}</ul>;
        } else {
            return <li key={this.props.displayName}>{this.props.displayName}</li>;
        }
    }
}
