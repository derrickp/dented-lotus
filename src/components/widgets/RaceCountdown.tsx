import * as React from "react";
import { RaceModel } from "../../../common/models/Race";
import { DATE_FORMAT, getDurationFromNow } from "../../../common/utils/date";
import * as moment from "moment";

import { Jumbotron, Button } from "react-bootstrap";

export interface RaceCountdownProps {
    race: Promise<RaceModel>;
    onclick: () => void;
}

export interface RaceCountdownState {
    timeRemaining: string;
}

export class RaceCountdown extends React.Component<RaceCountdownProps, any>{
    interval;
    nextRace: RaceModel;
    onclick: () => void;
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
        this.onclick = props.onclick;
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
        const jumbo =
            <Jumbotron id="race-countdown-jumbo">
                <h1>Next Race!</h1>
                <p>{this.nextRace.raceResponse.displayName + " " + this.state.timeRemaining}</p>
                <Button onClick={this.onclick} bsSize="large" bsStyle="primary" >Make Your Picks</Button>
            </Jumbotron>;
        return jumbo;
    }


}