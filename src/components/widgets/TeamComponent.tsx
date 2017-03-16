import * as React from "react";
import * as ReactDOM from "react-dom";
import { PropsBase } from "../../utilities/ComponentUtilities"; 
import { Form, Input } from "formsy-react-components";
import { TeamModel } from "../../../common/models/Team";
import { SelectBox, SelectOption } from "../../../react-select-component/SelectBox";

export interface TeamProps {
    team: TeamModel;
    userIsAdmin: boolean;
    small: boolean;
    allTeams: TeamModel[];
}

export interface TeamState {
    isEditing: boolean; 
    userIsAdmin: boolean;
}

export class TeamComponent extends React.Component<TeamProps, TeamState> {

    team: TeamModel; 

    /**
     *
     */
    constructor(props: TeamProps) {
        super(props);
        this.team = props.team
        this.state = { isEditing: false, userIsAdmin: props.userIsAdmin  };
    }

    editClicked(): void {
        this.setState({ isEditing: true });
    }

    closeEdit(): void {
        this.team.update();
        this.setState({ isEditing: false });
    }

    onValueChanged(name: string, value: any) {
        this.team[name] = value;
    } 

    render() {
        let content;
        if (this.state.isEditing) {
            content = <EditTeam team={this.team}  onEditClicked={this.editClicked.bind(this)} userIsAdmin={this.state.userIsAdmin} onCloseEdit={this.closeEdit.bind(this)} onValueChanged={this.onValueChanged.bind(this)} />
        } else {
            content = <DisplayTeam team={this.team}  onEditClicked={this.editClicked.bind(this)} userIsAdmin={this.state.userIsAdmin} onCloseEdit={this.closeEdit.bind(this)} onValueChanged={this.onValueChanged.bind(this)} />
        }
        return content;
    }
}


interface EditTeamProps {
    updateTeam?: (team: TeamModel) => Promise<TeamModel>; 
    team: TeamModel;
    userIsAdmin: boolean; 
    onEditClicked: () => void;
    onCloseEdit: () => void;
    onValueChanged: (name: string, value: any) => void;
}
function EditTeam(props: EditTeamProps) {
    return <Form > 
            <Input layout="vertical" type="text" value={props.team.name} onChange={props.onValueChanged} name="name" label="Name:" />
            <Input layout="vertical" type="text" value={props.team.headquartersCity} onChange={props.onValueChanged} name="headquartersCity" label="HQ City:" />
            <Input layout="vertical" type="text" value={props.team.abbreviation} onChange={props.onValueChanged} name="abbreviation" label="Abbreviation:" />
            <Input layout="vertical" type="number" value={props.team.points} onChange={props.onValueChanged} name="points" label="Points:" />
        <button onClick={props.onCloseEdit}>Save</button>
    </Form>
}

function DisplayTeam(props: EditTeamProps) {
    let editButton;
    if (props.userIsAdmin) {
        editButton = <button onClick={props.onEditClicked}>Edit</button>;
    }
    return <div className="driver"> 
        <h2 id="form-field-1">{props.team.name}</h2> 
        <label htmlFor="form-field-2">HQ City:</label><span id="form-field-2">{props.team.headquartersCity}</span><br />
        <label htmlFor="form-field-3">Abbreviation:</label><span id="form-field-3">{props.team.abbreviation}</span><br />
        <label htmlFor="form-field-4">Points:</label><span id="form-field-4">{props.team.points}</span><br /> 
        {editButton}
    </div>
}