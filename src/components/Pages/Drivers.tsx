import * as React from "react";
import * as ReactDOM from "react-dom";
import { PropsBase } from "../../utilities/ComponentUtilities";
import { TrackResponse as TrackModel } from "../../../common/models/Track";
import { TrackPage } from "./TrackPage";
import {DriverModel} from "../../../common/models/Driver";
import {DriverComponent} from "../widgets/DriverComponent"

export interface DriverProps {
    drivers: Promise<DriverModel[]>;
    userIsAdmin:boolean;
    updateDriver: (driverModel: DriverModel) => Promise<DriverModel>;
} 

export interface DriverState{
    drivers:DriverModel[];
    userIsAdmin:boolean;
}

export class Drivers extends React.Component<DriverProps, DriverState> {
    constructor(props: DriverProps) {
        super(props);
        this.state = {
            drivers: [],
            userIsAdmin:props.userIsAdmin
        };
        this.props.drivers.then(drivers => {
            drivers.sort((driver1, driver2) => {
                if (driver1.getName() < driver2.getName()) {
                    return -1;
                }
                if (driver1.getName() > driver2.getName()) {
                    return 1;
                }
                return 0;
            });
            this.setState({drivers:drivers});
        });
    }

    render() {
        if (!this.state.drivers.length) {
            return <div>Loading...</div>;
        }
        const entries = this.state.drivers.map(driver => {
            return <li key={driver.key} className="panel"><DriverComponent updateDriver={this.props.updateDriver} userIsAdmin={this.state.userIsAdmin} key={driver.abbreviation} driver={driver} small={true}/></li>
        });
        return <ul>{entries}</ul>
    }
}