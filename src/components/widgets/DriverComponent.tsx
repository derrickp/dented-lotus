import * as React from "react";
import * as ReactDOM from "react-dom";
import { PropsBase } from "../../utilities/ComponentUtilities";
import { DriverModel } from "../../../common/models/DriverModel";

export interface DriverProps {
    driver: DriverModel;
    small: boolean;
}
 
export class DriverComponent extends React.Component<DriverProps,any> {

    driver:DriverModel;

    /**
     *
     */
    constructor(props:DriverProps) {
        super(props);
        this.driver = props.driver
        
    }
}