import * as React from "react";
import * as ReactDOM from "react-dom";
import { RaceModel } from "../../../common/models/Race";
import { PredictionModel } from "../../../common/models/Prediction";
import { getDurationFromNow } from "../../../common/utils/date";
import { PredictionComponent } from "../widgets/Prediction";
import { Panel, Button, PanelGroup } from "react-bootstrap";
import {RaceInfo} from "../RaceInfo";

export interface RaceProps {
    race: RaceModel;
    small: boolean;
    isAdmin:boolean;
}

export interface RaceState {
    small: boolean;
    activeKey: string;
}

namespace ActiveKeys {
    export const PREDICTIONS = "predictions";
    export const INFO = "info";
}

export class RacePage extends React.Component<RaceProps, RaceState> {

    constructor(props: RaceProps) {
        super(props);
        this.state = {
            small: this.props.small,
            activeKey: ActiveKeys.PREDICTIONS
        };
        this.handleSelect = this.handleSelect.bind(this);
        this.saveUserPicks = this.saveUserPicks.bind(this);
    }

    toggleSize() {
        let size = this.state.small;
        this.setState({ small: !size });
    }

    getSmall() {
        return <div onClick={this.toggleSize.bind(this)} className="dl-panel">
            <div>{this.props.race.raceResponse.displayName} - SMALL</div>
            <div>{this.props.race.raceDate}</div>
            <div>{this.props.race.track.trackResponse.country}</div>
        </div>;
    }

    handleSelect(eventKey) {
        this.setState({ activeKey: eventKey });
    }

    saveUserPicks(model: PredictionModel): Promise<boolean> {
        return model.saveUserPicks();
    }

    getFull() {
        if (!this.props.race) {
            return <div>Loading...</div>;
        }

        const race = this.props.race;
        const predictionsTitle = (
            <div><h4 className="pull-left">{"Predictions"}</h4><div className="clearfix"></div></div>
        );
        
        const dFromNow = getDurationFromNow(race.cutoff);
        const timeRemaining = dFromNow.timeRemaining;
        const allowedPrediction = timeRemaining > 0;
        const predictionsStyle = allowedPrediction ? "primary" : "danger";
        const predictions = race.predictions.map((p) => { return <PredictionComponent allowedPrediction={allowedPrediction} save={this.saveUserPicks} key={p.json.key} prediction={p} /> });
        const predictionsPanel = <Panel eventKey={ActiveKeys.PREDICTIONS} bsStyle={predictionsStyle} header={predictionsTitle} expanded={true} defaultExpanded={true} collapsible={true}>
            {predictions}
        </Panel>;
        const infoPanel = <RaceInfo race={race} eventKey={ActiveKeys.INFO} canAddTrivia={this.props.isAdmin}/>;
        const panelGroup =
            <PanelGroup accordion={true} title={"Race Info"} key={race.key + "panelgroup"} defaultActiveKey={ActiveKeys.PREDICTIONS}>
                {infoPanel}
                {predictionsPanel}
            </PanelGroup>;
        return panelGroup;
    }

    render() {
        if (!this.props.race) {
            return <div>Loading... </div>
        } else {
            if (this.state.small) {
                return this.getSmall();
            } else {
                const content = this.getFull();
                const title = (
                    <div><h3>{this.props.race.raceResponse.displayName + "  " + this.props.race.raceDate}</h3></div>
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