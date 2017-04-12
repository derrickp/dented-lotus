import * as React from "react";
import * as ReactDOM from "react-dom";
import { PredictionModel } from "../../../common/models/Prediction";
import { getDurationFromNow } from "../../../common/utils/date";
import { PredictionComponent } from "../widgets/Prediction";
import { Panel, Button, PanelGroup } from "react-bootstrap";

export interface AllSeasonPicksProps {
    predictions: PredictionModel[];
}

export interface AllSeasonPicksState {
}

export class AllSeasonPicks extends React.Component<AllSeasonPicksProps, AllSeasonPicksState> {
    constructor(props: AllSeasonPicksProps) {
        super(props);
        this.state = {
        };
        this.savePrediction = this.savePrediction.bind(this);
    }

    savePrediction(model: PredictionModel) {
        return model.saveUserPicks();
    }

    render() {
        if (!this.props.predictions || !this.props.predictions.length) {
            return <div>Loading...</div>;
        }

        const predictionsTitle = (
            <div><h3 className="pull-left">{"All Season Predictions"}</h3><div className="clearfix"></div></div>
        );
        const dFromNow = getDurationFromNow("04/20/2017");
        const timeRemaining = dFromNow.timeRemaining;
        const allowedPrediction = timeRemaining > 0; 
        const predictionsStyle = allowedPrediction ? "primary" : "danger";
        const predictions = this.props.predictions.map((p) => { return <PredictionComponent allowedPrediction={allowedPrediction} save={this.savePrediction} key={p.json.key} prediction={p} /> });
        return <Panel bsStyle={predictionsStyle} header={predictionsTitle} expanded={true} defaultExpanded={true} collapsible={false}>
            {predictions}
        </Panel>;
    }
}