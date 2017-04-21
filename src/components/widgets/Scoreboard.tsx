import * as React from "react";
import { Button, Glyphicon, Panel, Table } from "react-bootstrap";
import { DriverModel } from "../../../common/models/Driver";
import { User, PublicUser } from "../../../common/models/User";

import { UserScoreboard } from "./UserScoreboard";

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
    publicUsers: PublicUser[];
    user: User;
    drivers: DriverModel[];
    title: string;
    clickItem?: (item: any) => void;
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

        this.state = {
            entrants: this.getEntrants(props)
        }
    }

    componentWillReceiveProps(newProps: ScoreboardProps) {

        this.setState({ entrants: this.getEntrants(newProps) });
    }

    getEntrants(props: ScoreboardProps): CanShowOnScoreboard[] {
        let entrants: CanShowOnScoreboard[];
        switch (props.type) {
            case ScoreboardType.DRIVERS:
                entrants = props.drivers.slice(0, props.count).map((driver: DriverModel, index: number) => {
                    const entrant: CanShowOnScoreboard = {
                        key: driver.key,
                        display: driver.name,
                        points: driver.points,
                        position: index + 1
                    };
                    return entrant;
                });
                break;
            case ScoreboardType.USERS:
                entrants = props.publicUsers.sort((publicUser1, publicUser2) => {
                    let out =  publicUser2.points - publicUser1.points;
                    if (!out){
                        out = publicUser1.display.localeCompare(publicUser2.display);
                    }
                    return out;
                }).slice(0, props.count).map((publicUser: PublicUser, index: number) => {
                    const entrant: CanShowOnScoreboard = {
                        key: UUID(),
                        display: publicUser.display,
                        points: publicUser.points,
                        position: index + 1
                    };
                    return entrant;
                });
                break;
        }
        return entrants;
    }

    render() {
        switch (this.props.type) {
            case ScoreboardType.USERS:
                return <UserScoreboard clickUser={this.props.clickItem} title={this.props.title} users={this.props.publicUsers}></UserScoreboard>;
            default:
                return <Panel header={this.props.title}>
                    <Table striped bordered condensed responsive>
                        <thead>
                            <tr>
                                <th>#</th><th>Name</th><th className="center-text">Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.entrants.map((e, i) => { return <tr key={e.key}><td>{e.position}</td><td>{e.display}</td><td className="center-text">{e.points}</td></tr> })}
                        </tbody>
                    </Table>
                </Panel>;
        }
    }
}