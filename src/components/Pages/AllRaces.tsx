import * as React from "react";
import * as ReactDOM from "react-dom";
import { PropsBase } from "../../utilities/ComponentUtilities";
import { Race as RaceModel } from "../../../common/models/Race";
import {RacePage}from "../Pages";

export interface AllRacesProps {
    races: RaceModel[];
}

export class AllRaces extends React.Component<AllRacesProps, any> {

    constructor(props: AllRacesProps) {
        super(props);
    }

    render() {
        const entries = this.props.races.map(race => {
            return <li key={race.id} className="panel"><RacePage key={race.id} race={Promise.resolve(race)} small={true}/></li>
        });
        return <ul>{entries}</ul>
    }
}