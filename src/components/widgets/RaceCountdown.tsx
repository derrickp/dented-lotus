import * as React from "react";
import { RaceModel } from "../../../common/models/Race";
import { DATE_FORMAT, getDurationFromNow } from "../../../common/utils/date";
import * as moment from "moment";

import { Jumbotron, Button, ButtonToolbar } from "react-bootstrap";

export interface RaceCountdownProps {
    race: Promise<RaceModel>;
    clickMakeNextRacePicks: () => void;
    clickMakeAllSeasonPicks: () => void;
}

export interface RaceCountdownState {
    fullDuration: string;
}

export class RaceCountdown extends React.Component<RaceCountdownProps, any>{
    interval;
    nextRace: RaceModel;
    /**
     *
     */
    constructor(props: RaceCountdownProps) {
        super(props);
        this.state = { timeRemaining: "" };
        this.tick = this.tick.bind(this);
        props.race.then(race => {
            this.nextRace = race;
        });
    }

    componentDidMount() {
        this.interval = setInterval(this.tick, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    tick() {
        if (!this.nextRace) {
            return;
        }
        const dFromNow = getDurationFromNow(this.nextRace.raceDate);
        this.setState({ timeRemaining: dFromNow.fullDuration });
    }
    render() {
        if (!this.nextRace) {
            return <span className="race-countdown">Loading race countdown...</span>;
        }
        const allSeasonDFromNow = getDurationFromNow("04/20/2017");
        
        const jumbo =
            <Jumbotron id="race-countdown-jumbo">
                <h1>Next Race!</h1>
                <p>{this.nextRace.raceResponse.displayName + " " + this.state.timeRemaining}</p>
                <ButtonToolbar >
                    <Button onClick={this.props.clickMakeNextRacePicks} bsSize="large" bsStyle="primary" >Make Your Picks</Button>
                    { allSeasonDFromNow.timeRemaining > 0 && <Button bsSize="large" bsStyle="primary" onClick={this.props.clickMakeAllSeasonPicks}>Make All Season Picks</Button> }
                </ButtonToolbar>
            </Jumbotron>;
        return jumbo;
    }


}