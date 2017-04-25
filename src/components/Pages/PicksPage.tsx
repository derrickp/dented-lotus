import { RaceModel } from "../../../common/models/Race";
import { PredictionModel } from "../../../common/models/Prediction";
import { RacePage } from "../Pages";
import { Accordion, Panel, Button } from "react-bootstrap";
import { getDurationFromNow } from "../../../common/utils/date";
import {DentedLotusComponentBase, DentedLotusProps, React,ReactDOM} from "../../DefaultImports"; 

export interface PicksPageProps extends DentedLotusProps {
    race: Promise<RaceModel>;
}

export interface PicksPageState {
    race: RaceModel;
}

export class PicksPage extends DentedLotusComponentBase<PicksPageProps, PicksPageState> {

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