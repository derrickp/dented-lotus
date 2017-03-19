import * as React from "react";
import * as ReactDOM from "react-dom";
import { RaceModel as RaceModel } from "../../../common/models/Race";
import { getDurationFromNow } from "../../../common/utils/date";
import { PredictionComponent } from "../widgets/Prediction";
import { Panel, Button, PanelGroup } from "react-bootstrap";

export interface RaceProps {
    race: RaceModel;
    small: boolean;
}

export interface RaceState {
    race: RaceModel;
    small: boolean;
    activeKey: string;
}

namespace ActiveKeys {
    export const PREDICTIONS = "predictions";
    export const INFO = "info";
}

export class RacePage extends React.Component<RaceProps, RaceState> {
    race: RaceModel;

    constructor(props: RaceProps) {
        super(props);
        this.state = {
            race: null,
            small: this.props.small,
            activeKey: ActiveKeys.PREDICTIONS
        };
        this.handleSelect = this.handleSelect.bind(this);
    }

    toggleSize() {
        let size = this.state.small;
        this.setState({ small: !size });
    }

    getSmall() {
        return <div onClick={this.toggleSize.bind(this)} className="dl-panel">
            <div>{this.state.race.raceResponse.displayName} - SMALL</div>
            <div>{this.state.race.raceDate}</div>
            <div>{this.state.race.track.trackResponse.country}</div>
        </div>;
    }

    handleSelect(eventKey) {
        this.setState({ activeKey: eventKey });
    }

    getFull() {
        if (!this.state.race) {
            return <div>Loading...</div>;
        }

        const race = this.state.race;
        const predictionsTitle = (
            <div><h5 className="pull-left">{"Predictions"}</h5>< Button className="pull-right"></Button><div className="clearfix"></div></div>
        );
        const title = (
            <div><h5 className="pull-left">{race.raceResponse.displayName + "  " + race.raceDate}</h5></div>
        );
        const dFromNow = getDurationFromNow(race.cutoff);
        const timeRemaining = dFromNow.timeRemaining;
        const predictionsStyle = timeRemaining > 0 ? "primary" : "danger";
        const predictions = race.predictions.map((p) => { return <PredictionComponent save={race.saveUserPicks} key={p.json.key} prediction={p} /> });
        const predictionsPanel = <Panel eventKey={ActiveKeys.PREDICTIONS} bsStyle={predictionsStyle} header={predictionsTitle} expanded={true} defaultExpanded={true} collapsible={true}>
            {predictions}
        </Panel>;
        const infoPanel =
            <Panel eventKey={ActiveKeys.INFO} bsStyle={"primary"} header={"Race Info"}>
                { race.track.trackResponse && <p>Track: {race.track.trackResponse.name}, {race.track.trackResponse.country}</p> }
                { race.winner && <p>Winner: {race.winner.name}</p> }
            </Panel>;
        const panelGroup =
            <PanelGroup accordion={true} title={"Race Info"} key={race.key + "panelgroup"} defaultActiveKey={ActiveKeys.PREDICTIONS}>
                {predictionsPanel}
                {infoPanel}
            </PanelGroup>;
        return panelGroup;
    }

    render() {
        if (!this.state.race) {
            return <div>Loading... </div>
        } else {
            if (this.state.small) {
                return this.getSmall();
            } else {
                const content = this.getFull();
                const title = (
                    <div><h3>{this.state.race.raceResponse.displayName + "  " + this.state.race.raceDate}</h3></div>
                );
                return (
                    <div>
                        {title}
                        {content}
                    </div>
                );
            }
        }
    }
}