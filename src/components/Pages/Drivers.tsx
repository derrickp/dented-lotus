import * as React from "react";
import * as ReactDOM from "react-dom";
import { TrackResponse as TrackModel } from "../../../common/models/Track";
import { TrackPage } from "./TrackPage";
import { DriverModel, DriverResponse } from "../../../common/models/Driver";
import { DriverComponent } from "../widgets/DriverComponent";
import { TeamComponent } from "../widgets/TeamComponent";
import { Form, Input } from "formsy-react-components";
import { TeamModel, TeamResponse } from "../../../common/models/Team";
import { Panel, Button, PanelGroup,Grid } from "react-bootstrap";
import { SelectBox, SelectOption } from "../../../react-select-component/SelectBox";

export interface DriverProps {
    drivers: DriverModel[];
    userIsAdmin: boolean;
    teams: TeamModel[];
    createDriver: (dr: DriverResponse) => Promise<boolean>;
    createTeam: (tr: TeamResponse) => Promise<boolean>;
}

export interface DriverState {
    userIsAdmin: boolean;
}

export class Drivers extends React.Component<DriverProps, DriverState> {
    constructor(props: DriverProps) {
        super(props);
        this.state = {
            userIsAdmin: props.userIsAdmin
        };   
    } 
    render() {
        if (!this.props.drivers.length) {
            return <div>Loading...</div>;
        }
        let output = null;
        let drivers = this.props.drivers.sort((a,b)=>{ 
            let out = b.points - a.points;
            if (!out){
                out = a.lastName.localeCompare(b.lastName);
            }
            return out;
    }).map(driver => {
            return <li key={driver.key} >
                <DriverComponent userIsAdmin={this.state.userIsAdmin} allTeams={this.props.teams} key={driver.abbreviation} driver={driver} small={true} />
            </li>
        });
        if (this.props.userIsAdmin) {
            drivers.push(<li key="admin"><DriverAdmin createDriver={this.props.createDriver} teams={this.props.teams} /></li>);
        }

        let teams = this.props.teams.map((team) => {
            return <li key={team.abbreviation} className="dl-panel">
                <TeamComponent userIsAdmin={this.state.userIsAdmin} allTeams={this.props.teams} key={team.abbreviation} team={team} small={true} />
            </li>
        });

        if (this.props.userIsAdmin) {
            teams.push(<li key="admin"><TeamAdmin createTeam={this.props.createTeam} /></li>);
        }
        return <Grid>
            <h1>Drivers</h1>
            <ul className="no-padding">{drivers}</ul>
            <h1>Teams</h1>
            <ul>{teams}</ul>
        </Grid>
    }
}

export interface DriverAdminProps {
    teams: TeamModel[]
    createDriver: (dr: DriverResponse) => Promise<boolean>;
}

export class DriverAdmin extends React.Component<DriverAdminProps, any>{
    defaultDriver: DriverResponse = {
        abbreviation: "",
        active: false,
        birthdate: "",
        firstName: "",
        flag: "",
        key: "",
        lastName: "",
        nationality: "",
        number: 0,
        points: 0,
        team: null,
        trivia: [""],
        wins: 0
    }
    driver:DriverResponse;
    constructor(props) {
        super(props);
        this.driver = this.defaultDriver;
        this.driver.team = props.teams[0];
        this.state = {
            isAdding: false
        }

    }

    addNewClicked() {
        this.setState({ isAdding: true });
    }

    saveClicked() {
        return this.props.createDriver(this.driver).then(() => {
            this.setState({ isAdding: false });
            this.driver = this.defaultDriver;
        })
    }
    onValueChanged(name: string, value: any) {
        this.driver[name] = value;
    }
    teamChanged(option:SelectOption) {
        this.driver.team = option.value.json;
    }


    getAddForm() {
        return <Form>
            <Input layout="vertical" type="text" value={this.driver.firstName} onChange={this.onValueChanged.bind(this)} name="firstName" label="First Name:" />
            <Input layout="vertical" type="text" value={this.driver.lastName} onChange={this.onValueChanged.bind(this)} name="lastName" label="Last Name:" />
            <Input layout="vertical" type="text" value={this.driver.nationality} onChange={this.onValueChanged.bind(this)} name="nationality" label="Nationality:" />
            <Input layout="vertical" type="number" value={this.driver.points} onChange={this.onValueChanged.bind(this)} name="points" label="Points:" />
            <Input layout="vertical" type="text" value={this.driver.wins} onChange={this.onValueChanged.bind(this)} name="wins" label="Wins:" />
            <SelectBox label="Team" onOptionChanged={this.teamChanged.bind(this)} options={this.props.teams} strings={[]} selectMessage="Select a team" />
            <button onClick={(e) => { this.saveClicked() }}>Close</button>
        </Form>
    }

    render() {
        let output;
        if (this.state.isAdding) {
            output = this.getAddForm();
        } else {
            output = <button onClick={this.addNewClicked.bind(this)}>Add new driver</button>;
        }
        return <Grid >{output}</Grid>;
    }
}

export interface TeamAdminProps {
    createTeam: (tr: TeamResponse) => Promise<boolean>;
}

export interface TeamAdminState {
    isAdding: boolean;
}

export class TeamAdmin extends React.Component<TeamAdminProps, TeamAdminState>{
    newTeam: TeamResponse = {
        abbreviation: "",
        headquartersCity: "",
        key: "",
        name: "",
        points: 0,
        trivia: [""]
    }
    /**
     *
     */
    constructor(props) {
        super(props);
        this.state = { isAdding: false };
    }

    addNewTeamClicked() {
        this.setState({ isAdding: true });
    }

    saveTeam() {
        this.props.createTeam(this.newTeam);
    }

    onValueChanged(name: string, value: any) {
        this.newTeam[name] = value;
    }

    getAddForm() {
        return <Form>
            <Input layout="vertical" type="text" value={this.newTeam.name} onChange={this.onValueChanged.bind(this)} name="name" label="Name:" />
            <Input layout="vertical" type="text" value={this.newTeam.headquartersCity} onChange={this.onValueChanged.bind(this)} name="headquartersCity" label="HQ City:" />
            <Input layout="vertical" type="text" value={this.newTeam.abbreviation} onChange={this.onValueChanged.bind(this)} name="abbreviation" label="Abbreviation:" />
            <Input layout="vertical" type="number" value={this.newTeam.points} onChange={this.onValueChanged.bind(this)} name="points" label="Points:" />
            <button onClick={(e) => { this.saveTeam() }}>Save</button>
        </Form>
    }

    render() {
        let output;
        if (this.state.isAdding) {
            output = this.getAddForm();
        } else {
            output = <button onClick={this.addNewTeamClicked.bind(this)}>Add new team</button>;
        }
        return <div className="dl-panel">{output}</div>;
    }
}