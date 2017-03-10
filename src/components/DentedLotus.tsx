import * as React from "react";
import * as ReactDOM from "react-dom";

import { Banner } from "./Banner";
import { UserComponent } from "./User";
import { StateManager } from "../StateManager";
import { BlogComponent } from "./BlogComponent";
import { RaceCountdown } from "./widgets/RaceCountdown";
import { RacePage, AllRaces, TrackPage, Tracks, Drivers, Pages } from "./Pages";
import { RaceModel } from "../../common/models/Race";
import { PropsBase } from "../utilities/ComponentUtilities";
import { getUrlParameters } from "../utilities/PageUtilities";
import { User } from "../../common/models/User";

import { GoogleLoginResponse } from "../../common/models/GoogleLoginResponse";

export interface DentedLotusProps extends PropsBase {

}

export interface DentedLotusState {
    parameters: any;
    sidebarOpen: boolean;
    race: Promise<RaceModel>;
    loggedIn: boolean;
}

export class DentedLotus extends React.Component<DentedLotusProps, DentedLotusState>{
    sidebarStyle = {
        root: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
        },
        sidebar: {
            zIndex: 2,
            position: 'absolute',
            top: 0,
            bottom: 0,
            transition: 'transform .3s ease-out',
            WebkitTransition: '-webkit-transform .3s ease-out',
            willChange: 'transform',
            overflowY: 'auto',
        },
        content: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'auto',
            transition: 'left .3s ease-out, right .3s ease-out',
        },
        overlay: {
            zIndex: 1,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0,
            visibility: 'hidden',
            transition: 'opacity .3s ease-out',
            backgroundColor: 'rgba(0,0,0,.3)',
        },
        dragHandle: {
            zIndex: 1,
            position: 'fixed',
            top: 0,
            bottom: 0,
        },
    }
    stateManager: StateManager;
    /**
     *
     */
    constructor(props: DentedLotusProps) {
        super(props);
        const parameters = getUrlParameters();
        this.stateManager = props.stateManager;
        this.state = { loggedIn: false, race: Promise.resolve(null), parameters: parameters, sidebarOpen: false };

        this.stateManager.watch("user", (user: User) => {
            this.onUserChange();
        });
    }

    componentDidMount() {
        this.onUserChange();
    }

    onUserChange() {
        const loggedIn = this.stateManager.isLoggedIn;
        if (!loggedIn) {
            let parameters = this.state.parameters;
            parameters.page = Pages.HOME;
            this.setState({ loggedIn: loggedIn, parameters: parameters });
        } else {
            this.setState({ loggedIn: loggedIn });
        }
    }

    launchRacePicks() {
        let parameters = this.state.parameters;
        parameters.page = Pages.RACE;
        this.setState({ parameters: parameters, race: this.stateManager.nextRace });
    }

    onPageChange(page: string) {
        const parameters = this.state.parameters;
        parameters.page = page;
        this.setState({ parameters: parameters });
    }

    getCurrentView() {
        switch (this.state.parameters.page) {
            case Pages.RACE:
                return <RacePage race={this.state.race} small={false} ></RacePage>;
            case Pages.USER:
                return <div>User!!!!</div>;
            case Pages.ALL_RACES:
                return <AllRaces races={this.stateManager.races} />;
            case Pages.TRACKS:
                return <Tracks tracks={this.stateManager.tracks} />;
            case Pages.DRIVERS:
                return <Drivers drivers={this.stateManager.drivers} allTeams={this.stateManager.teams} userIsAdmin={true} />
            default:
                return this.getHomePage();
        }
    }

    getHomePage() {
        return <div>
            <RaceCountdown onclick={this.launchRacePicks.bind(this)} stateManager={this.stateManager} race={this.stateManager.nextRace} />
            <BlogComponent stateManager={this.stateManager} />
        </div>;
    }

    render() {
        return <div>
            <Banner logout={this.stateManager.signOut.bind(this.stateManager)} loggedIn={this.state.loggedIn} completeGoogleLogin={this.stateManager.completeGoogleLogin.bind(this.stateManager)} onPageChange={this.onPageChange.bind(this)} stateManager={this.stateManager} title="Project Dented Lotus" />
            <div className="wrapper">
                {this.getCurrentView()}
            </div>
        </div>
    }
}