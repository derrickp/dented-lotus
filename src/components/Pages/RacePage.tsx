import * as React from "react";
import * as ReactDOM from "react-dom";
import { PropsBase } from "../../utilities/ComponentUtilities";
import { RaceModel as RaceModel } from "../../../common/models/Race";

export interface RaceProps {
    race: Promise<RaceModel>;
    small: boolean;
}

export interface RaceState {
    race: RaceModel;
    small: boolean;
}

export class RacePage extends React.Component<RaceProps, RaceState> {
    race: RaceModel;

    constructor(props: RaceProps) {
        super(props);
        this.state = {
            race: null,
            small: this.props.small
        };
        props.race.then(race => {
            return race.initialize().then(() => {
                this.setState({ race: race });
            });
        });
    }

    toggleSize() {
        let size = this.state.small;
        this.setState({ small: !size });
    }

    getSmall() {
        return <div onClick={this.toggleSize.bind(this)} className="panel">
            <div>{this.state.race.raceResponse.displayName} - SMALL</div>
            <div>{this.state.race.raceDate.toDateString()}</div>
            <div>{this.state.race.track.trackResponse.country}</div>
        </div>;
    }

    getFull() {
        return <div onClick={this.toggleSize.bind(this)} className="panel">
            <div>{this.state.race.raceResponse.displayName}</div>
            <div>{this.state.race.raceDate.toDateString()}</div>
            <div>{this.state.race.track.trackResponse.country}</div>
        </div>;
    }

    render() {
        if (!this.state.race) {
            return <div>Loading... </div>
        } else {
            if (this.state.small) {
                return this.getSmall();
            } else {
                return this.getFull();
            }
        }
    }
}