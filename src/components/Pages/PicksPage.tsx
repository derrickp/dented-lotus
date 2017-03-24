import * as React from "react";
import * as ReactDOM from "react-dom";
import { RaceModel } from "../../../common/models/Race";
import { PredictionModel } from "../../../common/models/Prediction";
import { RacePage } from "../Pages";
import { Accordion, Panel, Button } from "react-bootstrap";
import { getDurationFromNow } from "../../../common/utils/date";

export interface PicksPageProps {
    race: Promise<RaceModel>;
}

export interface PicksPageState {
    race: RaceModel;
}

export class PicksPage extends React.Component<PicksPageProps, PicksPageState> {

    constructor(props: PicksPageProps) {
        super(props);

        this.state = {
            race: null
        };
    }

    componentWillMount() {
        this.props.race.then(raceModel => {
            this.setState({ race: raceModel });
        });
    }

    render() {
        const mainContent: JSX.Element[] = [];
        if (!this.state.race) {
            mainContent.push(<div>{"Loading ..."}</div>);
        } else {
            mainContent.push(<div>{this.state.race.raceResponse.displayName}</div>)
        }
        return <div>{mainContent}</div>;
    }
}