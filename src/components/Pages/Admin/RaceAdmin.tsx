import * as React from "react";
import * as ReactDOM from "react-dom";
import { RaceModel } from "../../../../common/models/Race";
import { PredictionModel } from "../../../../common/models/Prediction";
import { RacePage } from "../../Pages";
import { Accordion, Panel, PanelGroup, Button, Grid } from "react-bootstrap";
import { getDurationFromNow } from "../../../../common/utils/date";
import { PredictionComponent } from "../../../components/widgets/Prediction";
import { confirmPromise } from "../../../utilities/UXUtilities";
import { savePredictionOutcomes, FinalChoice } from "../../../utilities/ServerUtils";


export interface RaceAdminProps {
    race: RaceModel;
    returnHome: () => any;
    id_token: string;
}

export interface RaceAdminState {
    activeKey: string;
}

namespace ActiveKeys {
    export const PREDICTIONS = "predictions";
    export const INFO = "info";
}

export class RaceAdminPage extends React.Component<RaceAdminProps, RaceAdminState> {

    constructor(props: RaceAdminProps) {
        super(props);
        this.state = {
            activeKey: ActiveKeys.PREDICTIONS
        };
        this.handleSelect = this.handleSelect.bind(this);
        this.saveUserPicks = this.saveUserPicks.bind(this);
        this.saveFinal = this.saveFinal.bind(this);
        this.returnHome = this.returnHome.bind(this);
    }

    handleSelect(eventKey) {
        this.setState({ activeKey: eventKey });
    }

    saveUserPicks(model: PredictionModel): Promise<boolean> {
        return Promise.resolve(true);
    }

    saveFinal(): Promise<boolean> {
        return confirmPromise("Are you sure you'd like to save these changes?", "confirm").then((confirmed) => {
            if (!confirmed) {
                return false;
            }
            // Do the scorpioning.
            const raceKey = this.props.race.key;
            const predictions = this.props.race.predictions;
            const finals = predictions.map((p) => { return { prediction: p.predictionResponse.key, final: p.predictionResponse.userPick }; })
            savePredictionOutcomes(raceKey, finals, this.props.id_token).then(() => {
                this.returnHome();
            }).catch((err) => {
                alert(err.message);
            });
        });
    }

    returnHome() {  
        this.props.returnHome();
    }

    getFull() {
        if (!this.props.race) {
            return <div>Loading...</div>;
        }

        const race = this.props.race;
        const predictionsTitle = (
            <div><h4 className="pull-left">{this.props.race.raceResponse.displayName + ": Scoring"}</h4><div className="clearfix"></div></div>
        );
        const predictions = race.predictions.map((p) => { return <PredictionComponent allowedPrediction={true} save={this.saveUserPicks} key={p.json.key} prediction={p} /> });
        const predictionsPanel = <Panel eventKey={ActiveKeys.PREDICTIONS} bsStyle={"primary"} header={predictionsTitle} expanded={true} defaultExpanded={true} collapsible={true}>
            {predictions}
            <Button onClick={this.saveFinal} bsSize="large" bsStyle={"primary"}>Save</Button>
            <Button onClick={this.returnHome} bsSize="large" bsStyle={"primary"}>Cancel</Button>
        </Panel>;
        const panelGroup =
            <PanelGroup accordion={true} title={"Race Info"} key={race.key + "panelgroup"} defaultActiveKey={ActiveKeys.PREDICTIONS}>
                {predictionsPanel}
            </PanelGroup>;
        return panelGroup;
    }

    render() {
        if (!this.props.race) {
            return <div>Loading... </div>
        } else {
            const content = this.getFull();
            const title = (
                <div><h3>{this.props.race.raceResponse.displayName + "  " + this.props.race.raceDate}</h3></div>
            );
            return (
                <Grid>
                    {title}
                    {content}
                </Grid>
            );
        }
    }
}