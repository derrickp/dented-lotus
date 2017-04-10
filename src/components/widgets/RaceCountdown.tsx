import * as React from "react";
import { RaceModel } from "../../../common/models/Race";
import { DATE_FORMAT, getDurationFromNow } from "../../../common/utils/date"; 
import * as moment from "moment";

import { Jumbotron, Button, ButtonToolbar, Row } from "react-bootstrap";

export interface RaceCountdownProps {
    race: RaceModel;
    clickMakeNextRacePicks: () => void;
    clickMakeAllSeasonPicks: () => void;
}

export interface RaceCountdownState {
    fullDuration: string;
}

export class RaceCountdown extends React.Component<RaceCountdownProps, any>{
    interval;
    /**
     *
     */
    constructor(props: RaceCountdownProps) {
        super(props);
        this.state = { timeRemaining: "" };
        this.tick = this.tick.bind(this);
    }

    componentDidMount() {
        this.tick();
        this.interval = setInterval(this.tick, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    tick() {
        if (!this.props.race) {
            return;
        }
        const dFromNow = getDurationFromNow(this.props.race.raceDate);
        this.setState({ timeRemaining: dFromNow.fullDuration });
    }
    render() {
        const allSeasonDFromNow = getDurationFromNow("04/20/2017");
        const jumbo = (
            <Jumbotron className="jumbotron"> 
                <div className="col-md-12 col-sm-12">
                    <h1>Next Race!</h1>
                    {this.props.race ? <div>
                        <div className="row">
                            <div className="col-md-4 col-sm-8">
                                <p>{this.props.race.raceResponse.displayName}</p>
                                <p>{this.state.timeRemaining}</p>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-4 col-sm-8">
                                <Button block={true} onClick={this.props.clickMakeNextRacePicks} bsSize="large" bsStyle="primary" >Make Your Picks</Button></div>
                            <div className="col-md-4 col-sm-8">
                                {allSeasonDFromNow.timeRemaining > 0 && <Button block={true} bsSize="large" bsStyle="primary" onClick={this.props.clickMakeAllSeasonPicks}>Make All Season Picks</Button>}
                            </div>
                        </div>
                    </div> : <span className="race-countdown">Loading race countdown...</span>
                    } 
                </div>
            </Jumbotron>
        )
        return jumbo;
    }


}