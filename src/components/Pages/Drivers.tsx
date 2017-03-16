import * as React from "react";
import * as ReactDOM from "react-dom";
import { PropsBase } from "../../utilities/ComponentUtilities";
import { TrackResponse as TrackModel } from "../../../common/models/Track";
import { TrackPage } from "./TrackPage";
import { DriverModel, DriverResponse } from "../../../common/models/Driver";
import { DriverComponent } from "../widgets/DriverComponent";
import { TeamComponent } from "../widgets/TeamComponent";
import { Form, Input } from "formsy-react-components";
import { TeamModel, TeamResponse } from "../../../common/models/Team";
import { SelectBox, SelectOption } from "../../../react-select-component/SelectBox";

export interface DriverProps {
    drivers: Promise<DriverModel[]>;
    userIsAdmin: boolean;
    allTeams: Promise<TeamModel[]>;
    onDriverAdded: (driver: DriverModel) => Promise<DriverModel[]>;
    onTeamAdded: (team: TeamModel) => Promise<TeamModel[]>;
}

export interface DriverState {
    drivers: DriverModel[];
    userIsAdmin: boolean;
    teams: TeamModel[];
}

export class Drivers extends React.Component<DriverProps, DriverState> {
    constructor(props: DriverProps) {
        super(props);
        this.state = {
            drivers: [],
            userIsAdmin: props.userIsAdmin,
            teams: null
        };
        this.props.allTeams.then((teams) => {
            this.setState({ teams: teams });

        });
        this.props.drivers.then(drivers => {
            drivers.sort((driver1, driver2) => { return driver1.lastName.localeCompare(driver2.lastName);});
            this.setState({ drivers: drivers });
        });
    }

    onDriverAdded(driver:DriverModel):Promise<boolean>{
        return this.props.onDriverAdded(driver).then((drivers)=>{
            this.setState({drivers:drivers});    
            return true;       
        });
    }

    onTeamAdded(team:TeamModel):Promise<boolean>{
        return this.props.onTeamAdded(team).then((teams)=>{
            this.setState({teams:teams});
            return true
        });
    }

    render() {
        if (!this.state.drivers.length) {
            return <div>Loading...</div>;
        }
        let output = null;
        let drivers = this.state.drivers.map(driver => {
            return <li key={driver.key} className="panel">
                <DriverComponent userIsAdmin={this.state.userIsAdmin} allTeams={this.state.teams} key={driver.abbreviation} driver={driver} small={true} />
            </li>
        });
        if (this.props.userIsAdmin) {
            drivers.push(<li key="admin"><DriverAdmin onDriverAdded={this.onDriverAdded.bind(this)}  teams={this.state.teams} /></li>);
        }

        let teams = this.state.teams.map((team) => {
            return <li key={team.abbreviation} className="panel">
                <TeamComponent userIsAdmin={this.state.userIsAdmin} allTeams={this.state.teams} key={team.abbreviation} team={team} small={true} />
            </li>
        });

        if (this.props.userIsAdmin) {
            teams.push(<li key="admin"><TeamAdmin onTeamAdded={this.onTeamAdded.bind(this)} /></li>);
        }
        return <div>
            <h1>Drivers</h1>
            <ul>{drivers}</ul>
            <h1>Teams</h1>
            <ul>{teams}</ul>
        </div>
    }
}

export interface DriverAdminProps {
    teams: TeamModel[]
    onDriverAdded: (driver: DriverModel) => Promise<boolean>;
}

export class DriverAdmin extends React.Component<DriverAdminProps, any>{
    onDriverAdded: (newDriver: DriverResponse) => Promise<void>;
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
        return this.props.onDriverAdded(new DriverModel(this.driver)).then(() => {
            this.setState({ isAdding: false })
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
        return <div className="panel">{output}</div>;
    }
}

export interface TeamAdminProps {
    onTeamAdded: (team: TeamResponse) => Promise<boolean>;
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
        this.props.onTeamAdded(this.newTeam);
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
        return <div className="panel">{output}</div>;
    }
}