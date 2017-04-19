import * as React from "react";

import { RaceModel } from "../../../../common/models/Race";
import { DriverModel } from "../../../../common/models/Driver";
import { TeamModel } from "../../../../common/models/Team";
import { PredictionResponse } from "../../../../common/responses/PredictionResponse";

import TextField from "material-ui/TextField";
import RaisedButton from 'material-ui/RaisedButton';
import LinearProgress from 'material-ui/LinearProgress';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

export interface GeneralAdminProps {
    callEndpoint: (urlFragment: string, body: string) => Promise<any>;
    races: RaceModel[];
    teams: TeamModel[];
    drivers: DriverModel[];
}

export interface GeneralAdminState {
    urlFragment: string;
    body: string;
    sending: boolean;
    other: string;
    race: string;
}

export class GeneralAdmin extends React.Component<GeneralAdminProps, GeneralAdminState> {

    constructor(props: GeneralAdminProps) {
        super(props);

        this.state = {
            urlFragment: "",
            body: "",
            sending: false,
            other: "",
            race: "null"
        };

        this.handleUrlFragmentChange = this.handleUrlFragmentChange.bind(this);
        this.handleBodyChange = this.handleBodyChange.bind(this);
        this.setNewOther = this.setNewOther.bind(this);
        this.handleRaceChange = this.handleRaceChange.bind(this);
        this.clickSend = this.clickSend.bind(this);
    }

    setNewOther(obj: any) {
        if (obj) {
            this.setState({ other: JSON.stringify(obj, null, 2) });
        }
    }

    handleRaceChange(event, key: number, value: any) {
        this.setState({ race: value });
        const race = this.props.races.filter(race => race.key === value)[0];
        const obj: any = race ? {
            key: race.json.key,
            cutoff: race.json.cutoff,
            displayName: race.json.displayName,
            raceDate: race.json.raceDate
        } : {};
        this.setNewOther(obj);
    }

    handleBodyChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
        this.setState({ body: event.currentTarget.value });
    }

    handleUrlFragmentChange(event: React.ChangeEvent<any>) {
        this.setState({ urlFragment: event.currentTarget.value });
    }

    clickSend() {
        this.setState({ sending: true });
        this.props.callEndpoint(this.state.urlFragment, this.state.body).then(response => {
            if (typeof response === "string") {
                this.setState({ sending: false, other: response });
            }
            else {
                this.setState({ sending: false, other: JSON.stringify(response, null, 2) });
            }
        });
    }

    render() {
        const textAreaStyle: React.CSSProperties = {
            width: "50%",
            height: "40em"
        };
        const raceItems = this.props.races.map((race, index) => {
            return <MenuItem key={index+1} primaryText={race.raceResponse.displayName} value={race.key}></MenuItem>;
        });
        raceItems.splice(0, 0, <MenuItem key={0} value={"null"} primaryText={"Choose Race"}></MenuItem>)
        return (
            <div>
                <DropDownMenu onChange={this.handleRaceChange} value={this.state.race} >
                    {raceItems}
                </DropDownMenu>
                <br />
                <TextField
                    hintText={"Url Fragment"}
                    value={this.state.urlFragment}
                    onChange={this.handleUrlFragmentChange}>
                </TextField>
                <br />
                <textarea style={textAreaStyle} onChange={this.handleBodyChange} value={this.state.body} />
                <textarea style={textAreaStyle} value={this.state.other} />
                <br />
                <RaisedButton label="Send" primary={true} onClick={this.clickSend} />
                {this.state.sending && <LinearProgress mode="indeterminate" />}
            </div>
        );
    }
}