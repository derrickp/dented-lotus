import * as React from "react";
import * as ReactDOM from "react-dom";
import { DriverModel } from "../../../common/models/Driver";
import { Form, Input } from "formsy-react-components";
import { Grid, Row, Col, Panel } from "react-bootstrap";
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
        editButton = <div className="row"><button onClick={props.onEditClicked}>Edit</button></div>;
    }
    let imageUrl = "images/drivers/" + props.driver.key + ".jpg";
    let flag = props.driver.flag;
    let wins = props.driver.wins || 0;
    let points = props.driver.points || 0;
    let header = <div >
        <h3 className="name inline-block">{props.driver.firstName}&nbsp;{props.driver.lastName}</h3><img className="flag inline-block" title={props.driver.nationality} src={flag} />
    </div>
    return <Panel header={header}>
        <div>
            <Row>
                <Col className="driver-info center-block" md={3}>
                    <div className="info-panel">
                        <div>{points}</div>
                        <label >Points</label>
                    </div>
                </Col>
                <Col className="driver-info center-block" md={3}>
                    <div className="info-panel">
                        <div >{wins}</div>
                        <label >Wins</label>
                    </div>
                </Col>
                <Col className="driver-info center-block" md={3}>
                    <div className="info-panel">
                        <div >{props.driver.team.display}</div>
                        <label>Team</label>
                    </div>
                </Col>
                <Col md={3}>
                    <div className=" ">
                        <img className="img-responsive center-block" src={imageUrl} />
                    </div>
                </Col>
            </Row>

            {editButton}
        </div>
    </Panel>
}