import * as React from "react";
import * as ReactDOM from "react-dom";
import { PropsBase } from "../../utilities/ComponentUtilities";
import { DriverModel } from "../../../common/models/Driver";
import { Form, Input } from "formsy-react-components";
import { ReactSelectize, SimpleSelect, MultiSelect } from 'react-selectize';

export interface DriverProps {
    driver: DriverModel;
    userIsAdmin: boolean;
    small: boolean;
    allTeams: Promise<string[]>;
}

export interface DriverState {
    isEditing: boolean;
    teams: string[];
    userIsAdmin: boolean;
}

export class DriverComponent extends React.Component<DriverProps, DriverState> {

    driver: DriverModel;

    /**
     *
     */
    constructor(props: DriverProps) {
        super(props);
        this.driver = props.driver
        this.state = { isEditing: false, userIsAdmin: props.userIsAdmin, teams: null };
        this.props.allTeams.then((teams) => {
            this.setState({ teams: teams })
        });
    }

    editClicked(): void {
        this.setState({ isEditing: true });
    }

    closeEdit(): void {
        this.driver.update();
        this.setState({ isEditing: false });
    }

    onValueChanged(name: string, value: any) {
        this.driver[name] = value;
    }

    render() {
        let content;
        if (this.state.isEditing) {
            content = <EditDriver driver={this.driver} teams={this.state.teams} onEditClicked={this.editClicked.bind(this)} userIsAdmin={this.state.userIsAdmin} onCloseEdit={this.closeEdit.bind(this)} onValueChanged={this.onValueChanged.bind(this)} />
        } else {
            content = <DisplayDriver driver={this.driver} teams={this.state.teams} onEditClicked={this.editClicked.bind(this)} userIsAdmin={this.state.userIsAdmin} onCloseEdit={this.closeEdit.bind(this)} onValueChanged={this.onValueChanged.bind(this)} />
        }
        return content;
    }
}


interface EditDriverProps {
    updateDriver?: (driverModel: DriverModel) => Promise<DriverModel>;
    driver: DriverModel;
    userIsAdmin: boolean;
    teams: string[];
    onEditClicked: () => void;
    onCloseEdit: () => void;
    onValueChanged: (name: string, value: any) => void;
}
function EditDriver(props: EditDriverProps) {
    return <Form onSubmit={(data) => { props.updateDriver(this.props.driver); }}>
        <Input layout="vertical" type="text" value={props.driver.firstName} onChange={props.onValueChanged} name="firstName" label="First Name:" />
        <Input layout="vertical" type="text" value={props.driver.lastName} onChange={props.onValueChanged} name="lastName" label="Last Name:" />
        <Input layout="vertical" type="text" value={props.driver.nationality} onChange={props.onValueChanged} name="nationality" label="Nationality:" />
        <Input layout="vertical" type="number" value={props.driver.points} onChange={props.onValueChanged} name="points" label="Points:" />
        <Input layout="vertical" type="text" value={props.driver.wins} onChange={props.onValueChanged} name="wins" label="Wins:" />
        <SimpleSelect  onValueChange={(item)=>{props.onValueChanged("team",item.value)}}>{props.teams.map((t)=>{return <option key={t} value={t}>{t}</option>})}</SimpleSelect>
        <button onClick={props.onCloseEdit}>Close</button>
    </Form>
}

function DisplayDriver(props: EditDriverProps) {
    let editButton;
    if (props.userIsAdmin) {
        editButton = <button onClick={props.onEditClicked}>Edit</button>;
    }
    return <div className="driver">
        <label htmlFor="form-field-1">First Name:</label><span id="form-field-1">{props.driver.firstName}</span><br />
        <label htmlFor="form-field-2">Last Name:</label><span id="form-field-2">{props.driver.lastName}</span><br />
        <label htmlFor="form-field-3">Nationality:</label><span id="form-field-3">{props.driver.nationality}</span><br />
        <label htmlFor="form-field-4">Points:</label><span id="form-field-4">{props.driver.points}</span><br />
        <label htmlFor="form-field-5">Wins:</label><span id="form-field-5">{props.driver.wins}</span><br />
        <label htmlFor="form-field-6">Team:</label><span id="form-field-5">{props.driver.team}</span><br />
        {editButton}
    </div>
}