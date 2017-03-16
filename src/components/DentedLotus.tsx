import * as React from "react";
import * as ReactDOM from "react-dom";

import { Banner } from "./Banner";
import { UserComponent } from "./User";
import { StateManager } from "../StateManager";
import { BlogComponent } from "./BlogComponent";
import { RaceCountdown } from "./widgets/RaceCountdown";
import { RacePage, AllRaces, TrackPage, Tracks, Drivers, Pages, Signup } from "./Pages";
import { RaceModel } from "../../common/models/Race";
import { PropsBase } from "../utilities/ComponentUtilities";
import { getUrlParameters } from "../utilities/PageUtilities";
import { User } from "../../common/models/User";

import { GoogleLoginResponse } from "../../common/models/GoogleLoginResponse";

export interface DentedLotusProps extends PropsBase {

}

interface Parameters {
    page: string;
}

export interface DentedLotusState {
    parameters: Parameters;
    sidebarOpen: boolean;
    race: Promise<RaceModel>;
    loggedIn: boolean;
    signUpMethod?: string;
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
        this.launchRacePicks = this.launchRacePicks.bind(this);
        this.signUp = this.signUp.bind(this);
        this.onPageChange = this.onPageChange.bind(this);
        this.changeRace = this.changeRace.bind(this);
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

    changeRace(race: RaceModel) {
        const parameters = this.state.parameters;
        parameters.page = Pages.RACE;
        this.setState({ parameters: parameters, race: Promise.resolve(race) })
    }

    getCurrentView() {
        switch (this.state.parameters.page) {
            case Pages.RACE:
                // return <RacePage race={this.state.race} small={false} ></RacePage>;
                return <div></div>;
            case Pages.USER:
                return <div>User!!!!</div>;
            case Pages.ALL_RACES:
                return <AllRaces raceClick={this.changeRace} races={this.stateManager.races} selectedRace={this.state.race} />;
            case Pages.TRACKS:
                return <Tracks tracks={this.stateManager.tracks} />;
            case Pages.DRIVERS:
                return <Drivers drivers={this.stateManager.drivers} allTeams={this.stateManager.teams} userIsAdmin={true} onDriverAdded={this.stateManager.saveDriver.bind(this.stateManager)} onTeamAdded={this.stateManager.saveTeam.bind(this.stateManager)} />
            case Pages.SIGN_UP:
                return <Signup onSubmit={this.stateManager.signup} type={this.state.signUpMethod} />
            default:
                return this.getHomePage();
        }
    }

    getHomePage() {
        const components: any[] = [];

        if (this.stateManager.isLoggedIn) {
            components.push(<RaceCountdown onclick={this.launchRacePicks} stateManager={this.stateManager} race={this.stateManager.nextRace} />);
        }
        components.push(<BlogComponent stateManager={this.stateManager} />);
        return <div>{components}</div>
    }

    signUp(type: string) {
        let parameters = this.state.parameters;
        parameters.page = Pages.SIGN_UP;
        this.setState({ parameters: parameters, signUpMethod: type });
    }

    render() {
        let mainContent: JSX.Element[] = [];
        if (this.state.parameters.page === Pages.HOME) {
            mainContent.push(<div className="header-section"></div>);
        }
        mainContent.push(<div className="wrapper">{this.getCurrentView()}</div>);

        return <div>
            <Banner signUp={this.signUp} logout={this.stateManager.signOut} loggedIn={this.state.loggedIn} completeGoogleLogin={this.stateManager.completeGoogleLogin} onPageChange={this.onPageChange} stateManager={this.stateManager} title="Project Dented Lotus" />
            {mainContent}
        </div>;

    }
}