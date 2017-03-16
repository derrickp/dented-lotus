import * as React from "react";
import * as ReactDOM from "react-dom";
import { PropsBase } from "../../utilities/ComponentUtilities";
import { RaceModel } from "../../../common/models/Race";
import { PredictionModel } from "../../../common/models/Prediction";
import { RacePage } from "../Pages";
import { Accordion, Panel, Button } from "react-bootstrap";
import { getDurationFromNow } from "../../../common/utils/date";

export interface AllRacesProps {
    races: Promise<RaceModel[]>;
    raceClick: (race: RaceModel) => void;
    selectedRace?: Promise<RaceModel>;
}

export interface AllRacesState {
    races: RaceModel[];
    expandedRace: RaceModel;
}

export class AllRaces extends React.Component<AllRacesProps, AllRacesState> {

    constructor(props: AllRacesProps) {
        super(props);
        this.state = {
            races: null,
            expandedRace: null
        };
        props.races.then(raceModels => {
            if (props.selectedRace) {
                props.selectedRace.then(selectedRace => {
                    this.setState({ races: raceModels, expandedRace: selectedRace })
                });
            }
            else {
                this.setState({ races: raceModels });
            }
        });
    }

    render() {
        if (!this.state.races) {
            return <div>Loading...</div>;
        }
        const panels: JSX.Element[] = [];
        for (const race of this.state.races) {
            const panel = this.getRacePanel(race);
            panels.push(panel);
        }
        return <Accordion >{panels}</Accordion>
    }

    getRacePanel(race: RaceModel): JSX.Element {
        const expanded = race === this.state.expandedRace;
        const dFromNow = getDurationFromNow(race.raceDate);
        const buttonText = dFromNow.duration.seconds() <= 0 ? "View Picks" : "Make Picks";
        const buttonStyle = dFromNow.duration.seconds() <= 0 ? "danger" : "primary";

        const clickHandler = () => {
            this.props.raceClick(race);
        };

        const panel = 
            <Panel eventKey={race.key} id={race.key} key={race.key} header={race.raceResponse.displayName} collapsible={true} defaultExpanded={expanded} expanded={expanded}>
                <div>
                    <Button onClick={clickHandler} bsSize="large" bsStyle={buttonStyle}>{buttonText}</Button>
                </div>
            </Panel>;
        return panel;
    }
}