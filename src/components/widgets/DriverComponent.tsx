import * as React from "react";
import * as ReactDOM from "react-dom";
import { PropsBase } from "../../utilities/ComponentUtilities";
import { DriverModel } from "../../../common/models/Driver";
import { Form, Input } from "formsy-react-components";
import { TeamModel } from "../../../common/models/Team";
import { SelectBox, SelectOption } from "../../../react-select-component/SelectBox";

export interface DriverProps {
    driver: DriverModel;
    userIsAdmin: boolean;
    small: boolean;
    allTeams: TeamModel[];
}

export interface DriverState {
    isEditing: boolean;
    teams: TeamModel[];
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
        this.state = { isEditing: false, userIsAdmin: props.userIsAdmin, teams: this.props.allTeams };
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

    onTeamChanged(team: SelectOption) {
        this.driver.team = team.value;
    }

    render() {
        let content;
        if (this.state.isEditing) {
            content = <EditDriver driver={this.driver} onTeamChanged={this.onTeamChanged.bind(this)} teams={this.state.teams} onEditClicked={this.editClicked.bind(this)} userIsAdmin={this.state.userIsAdmin} onCloseEdit={this.closeEdit.bind(this)} onValueChanged={this.onValueChanged.bind(this)} />
        } else {
            content = <DisplayDriver driver={this.driver} teams={this.state.teams} onEditClicked={this.editClicked.bind(this)} userIsAdmin={this.state.userIsAdmin} onCloseEdit={this.closeEdit.bind(this)} onValueChanged={this.onValueChanged.bind(this)} />
        }
        return content;
    }
}


interface EditDriverProps {
    updateDriver?: (driverModel: DriverModel) => Promise<DriverModel>;
    onTeamChanged?: (team: TeamModel) => Promise<void>;
    driver: DriverModel;
    userIsAdmin: boolean;
    teams: TeamModel[];
    onEditClicked: () => void;
    onCloseEdit: () => void;
    onValueChanged: (name: string, value: any) => void;
}
function EditDriver(props: EditDriverProps) {
    if (!props.driver.team) {
        props.driver.team = props.teams[0];
    }
    return <Form onSubmit={(data) => { props.updateDriver(props.driver); }}>
        <Input layout="vertical" type="text" value={props.driver.firstName} onChange={props.onValueChanged} name="firstName" label="First Name:" />
        <Input layout="vertical" type="text" value={props.driver.lastName} onChange={props.onValueChanged} name="lastName" label="Last Name:" />
        <Input layout="vertical" type="text" value={props.driver.nationality} onChange={props.onValueChanged} name="nationality" label="Nationality:" />
        <Input layout="vertical" type="number" value={props.driver.points} onChange={props.onValueChanged} name="points" label="Points:" />
        <Input layout="vertical" type="text" value={props.driver.wins} onChange={props.onValueChanged} name="wins" label="Wins:" />
        <SelectBox label="Team" onOptionChanged={props.onTeamChanged} options={props.teams} strings={[]} selectMessage="Select a team" />
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
        <label htmlFor="form-field-6">Team:</label><span id="form-field-5">{props.driver.team.display}</span><br />
        {editButton}
    </div>
}