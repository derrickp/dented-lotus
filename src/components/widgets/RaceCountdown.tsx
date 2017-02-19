import * as React from "react";
import { PropsBase } from "../../utilities/ComponentUtilities";
import * as moment from "moment";
export interface RaceCountdownProps extends PropsBase {
    displayName: string;
    cutoffDate: string;
    onclick: () => void;
}

export class RaceCountdown extends React.Component<RaceCountdownProps, any>{
    interval;
    nextRace;
    onclick: () => void;
    /**
     *
     */
    constructor(props: RaceCountdownProps) {
        super(props);
        this.state = { timeRemaining: 0 };
        this.tick = this.tick.bind(this);
        this.props.stateManager.getNextRace().then((race) => {
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
        let cutoffTime = moment(this.nextRace.date);
        let now = moment();
        let timeRemaining = cutoffTime.diff(now);
        let duration = moment.duration(timeRemaining, "milliseconds");
        let days = Math.floor(duration.asDays());
        let hours = Math.floor(duration.subtract(days, "days").asHours());
        let minutes = Math.floor(duration.subtract(hours, "hours").asMinutes());
        let seconds = Math.floor(duration.subtract(minutes, "minutes").asSeconds());
        let strHours = ("0" + hours.toString()).slice(-2);
        let strMinutes = ("0" + minutes.toString()).slice(-2);
        let strSeconds = ("0" + seconds.toString()).slice(-2);
        let output = "";
        if (days == 1) {
            output += days.toString() + " day ";
        } else if (days > 1) {
            output += days.toString() + " days, ";
        }
        output += strHours + ":" + strMinutes + ":" + strSeconds;
        this.setState({ timeRemaining: output });
    }
    render() {
        if (!this.nextRace) {
            return <span className="race-countdown">Loading race countdown...</span>;
        }
        return <div className="race-countdown"><span>{this.nextRace.displayName}</span>:&nbsp;<span className="timer">{this.state.timeRemaining}</span><span onClick={this.onclick} className="button">Make Your Picks</span></div>
    }


}