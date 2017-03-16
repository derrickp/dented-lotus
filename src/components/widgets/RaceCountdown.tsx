import * as React from "react";
import { RaceModel } from "../../../common/models/Race";
import { DATE_FORMAT, getDurationFromNow } from "../../../common/utils/date";
import { PropsBase } from "../../utilities/ComponentUtilities";
import * as moment from "moment";

export interface RaceCountdownProps extends PropsBase {
    race: Promise<RaceModel>;
    onclick: () => void;
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
        this.state = { timeRemaining: 0 };
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
        return <div className="race-countdown"><span>{this.nextRace.raceResponse.displayName + " "}</span><span className="timer">{this.state.timeRemaining}</span><span onClick={this.onclick} className="button">Make Your Picks</span></div>
    }


}