import * as React from "react";
import * as ReactDOM from "react-dom";
import { PropsBase } from "../../utilities/ComponentUtilities";
import { RaceModel as RaceModel } from "../../../common/models/Race";
import { getDurationFromNow } from "../../../common/utils/date";
import { PredictionComponent } from "../widgets/Prediction";
import { Panel, Button } from "react-bootstrap";

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
    }

    componentWillMount() {
        this.props.race.then(raceModel => {
            this.setState({ race: raceModel });
        });
    }

    toggleSize() {
        let size = this.state.small;
        this.setState({ small: !size });
    }

    getSmall() {
        return <div onClick={this.toggleSize.bind(this)} className="panel">
            <div>{this.state.race.raceResponse.displayName} - SMALL</div>
            <div>{this.state.race.raceDate}</div>
            <div>{this.state.race.track.trackResponse.country}</div>
        </div>;
    }


    getFull() {
        if (!this.state.race) {
            return <div>Loading...</div>;
        }

        const race = this.state.race;
        const title = (
            <div><h4 className="pull-left">{race.raceResponse.displayName + "  " + race.raceDate}</h4>< Button className="pull-right"></Button><div className="clearfix"></div></div>
        );
        const dFromNow = getDurationFromNow(race.cutoff);
        const timeRemaining = dFromNow.timeRemaining;
        const bsStyle = timeRemaining > 0 ? "primary" : "danger";
        const predictions = race.predictions.map((p) => { return <PredictionComponent key={p.json.key} prediction={p} /> });
        const panel = <Panel key={race.key} id={race.key} bsStyle={bsStyle} header={title} expanded={true} collapsible={false}>
            {predictions}
        </Panel>;
        return panel;
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