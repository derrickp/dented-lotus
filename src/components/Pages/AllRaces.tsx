import * as React from "react";
import * as ReactDOM from "react-dom";
import { PropsBase } from "../../utilities/ComponentUtilities";
import { RaceModel as RaceModel } from "../../../common/models/Race";
import { RacePage } from "../Pages";

export interface AllRacesProps {
    races: Promise<RaceModel[]>;
}

export interface AllRacesState {
    races: RaceModel[];
}

export class AllRaces extends React.Component<AllRacesProps, AllRacesState> {

    constructor(props: AllRacesProps) {
        super(props);
        this.state = {
            races: null
        };
        props.races.then(raceModels => {
            this.setState({ races: raceModels });
        });
    }

    render() {
        if (!this.state.races) {
            return <div>Loading...</div>;
        }
        const entries = this.state.races.map(race => {
            return <li key={race.key} className="panel"><RacePage key={race.key} race={Promise.resolve(race)} small={true} /></li>
        });
        return <ul>{entries}</ul>
    }
}