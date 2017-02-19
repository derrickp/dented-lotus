import * as React from "react";
import {PropsBase} from "../utilities/ComponentUtilities";

export interface HeaderProps extends PropsBase{

}

export class HeaderSection extends React.Component<HeaderProps,any>{
    render() {
        return <div className="header-section"></div>
    }
}