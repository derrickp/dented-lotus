import * as React from "react";
import { Button, Glyphicon, Panel, Table } from "react-bootstrap";
import { DriverModel } from "../../../common/models/Driver";
import { User } from "../../../common/models/User";
import { StateManager } from "../../StateManager";
import * as UUID from "uuid/v1";
export class ScoreboardType {
    static DRIVERS = "drivers";
    static USERS = "users";
    static TEAMS = "teams";
}

export interface ScoreboardProps {
    count: number;
    /**Scoreboard Type: Drivers or Users */
    type: string;
    stateManager: StateManager;
    title: string;
}
export interface CanShowOnScoreboard {
    points: number;
    display: string;
    key: string;
    position: number;
}

export interface ScoreboardState {
    entrants: CanShowOnScoreboard[];
}


export class Scoreboard extends React.Component<ScoreboardProps, any>{

    /**
     *
     */
    constructor(props: ScoreboardProps) {
        super(props);
        let prom;
        switch (props.type) {
            case ScoreboardType.DRIVERS:
                prom = props.stateManager.drivers;
                break;
            case ScoreboardType.USERS:
                prom = props.stateManager.allUsers;
                break;
        }
        this.state = {
            entrants: []
        }
        prom.then((entrants: CanShowOnScoreboard[]) => {
            entrants.forEach((e, i) => {
                e.key = UUID();
                e.position = i + 1;
            })
            entrants.sort((a, b) => {
                if (this.state.sortDir && this.state.sortDir == "ASC") {
                    return a.points - b.points;
                } else {
                    return b.points - a.points;
                }
            })
            this.setState({
                entrants: entrants.slice(0, this.props.count)
            })
        })
    }

    render() {
        return <Panel>
            <h3>{this.props.title}</h3>
            <Table striped bordered condensed responsive>
                <thead>
                    <tr>
                        <th>#</th><th>Name</th><th>Points</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.entrants.map((e, i) => { return <tr key={e.key}><td>{e.position}</td><td>{e.display}</td><td>{e.points}</td></tr> })}
                </tbody>
            </Table>
        </Panel>
    }
}