import * as React from "react";
import * as ReactDOM from "react-dom";

import { Banner } from "./Banner";
import { UserComponent } from "./User";
import { StateManager } from "../StateManager";
import { BlogsComponent } from "./BlogsComponent";
import { RaceCountdown } from "./widgets/RaceCountdown";
import { RacePage, AllRaces, TrackPage, Tracks, Drivers, Pages, Signup } from "./Pages";
import { RaceModel } from "../../common/models/Race";
import { TeamModel } from "../../common/models/Team";
import { DriverModel } from "../../common/models/Driver";
import { BlogResponse } from "../../common/models/Blog";
import { getUrlParameters } from "../utilities/PageUtilities";
import { User } from "../../common/models/User";

import { GoogleLoginResponse } from "../../common/models/GoogleLoginResponse";

export interface DentedLotusProps {
    stateManager: StateManager;
}

interface Parameters {
    page: string;
}

export interface DentedLotusState {
    parameters: Parameters;
    sidebarOpen: boolean;
    loggedIn: boolean;
    signUpMethod?: string;
    teams: TeamModel[];
    races: RaceModel[];
    race: RaceModel;
    drivers: DriverModel[];
    blogs: BlogResponse[];
}

export class DentedLotus extends React.Component<DentedLotusProps, DentedLotusState>{
    stateManager: StateManager;
    /**
     *
     */
    constructor(props: DentedLotusProps) {
        super(props);
        const parameters = getUrlParameters();
        this.stateManager = props.stateManager;
        this.state = {
            loggedIn: false,
            race: null,
            parameters: parameters,
            sidebarOpen: false,
            drivers: [],
            races: [],
            teams: [],
            blogs: []
        };
        this.launchRacePicks = this.launchRacePicks.bind(this);
        this.signUp = this.signUp.bind(this);
        this.onPageChange = this.onPageChange.bind(this);
        this.changeRace = this.changeRace.bind(this);
        this.stateManager.watch("user", () => {
            this.onUserChange();
        });
        this.stateManager.watch("races", () => {
            this.stateManager.races.then(races => {
                this.setState({ races: races });
            });
        });
        this.stateManager.watch("teams", () => {
            this.stateManager.teams.then(teams => {
                this.setState({ teams: teams });
            });
        });
        this.stateManager.watch("drivers", () => {
            this.stateManager.drivers.then(drivers => {
                this.setState({ drivers: drivers });
            });
        });
        this.stateManager.watch("blogs", () => {
            this.stateManager.blogs.then(blogs => {
                this.setState({ blogs: blogs });
            });
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
        this.stateManager.nextRace.then(race => {
            this.setState({ parameters: parameters, race: race });
        });
    }

    onPageChange(page: string) {
        const parameters = this.state.parameters;
        parameters.page = page;
        this.setState({ parameters: parameters });
    }

    changeRace(race: RaceModel) {
        const parameters = this.state.parameters;
        parameters.page = Pages.RACE;
        this.setState({ parameters: parameters, race: race })
    }

    getCurrentView() {
        switch (this.state.parameters.page) {
            case Pages.RACE:
                return <RacePage race={this.state.race} small={false} ></RacePage>;
            // return <div></div>;
            case Pages.USER:
                return <div>User!!!!</div>;
            case Pages.ALL_RACES:
                return <AllRaces raceClick={this.changeRace} races={this.state.races} selectedRace={this.state.race} />;
            case Pages.TRACKS:
                return <Tracks tracks={this.stateManager.tracks} />;
            case Pages.DRIVERS:
                return <Drivers drivers={this.state.drivers} teams={this.state.teams} userIsAdmin={true} createDriver={this.stateManager.createDriver} createTeam={this.stateManager.createTeam} />
            case Pages.SIGN_UP:
                return <Signup onSubmit={this.stateManager.signup} type={this.state.signUpMethod} />
            default:
                return this.getHomePage();
        }
    }

    getHomePage() {
        const components: JSX.Element[] = [];

        if (this.stateManager.isLoggedIn) {
            components.push(<RaceCountdown key={1} onclick={this.launchRacePicks} race={this.stateManager.nextRace} />);
        }
        components.push(<BlogsComponent key={2} blogs={this.state.blogs} numberBlogs={3} />);
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
            mainContent.push(<div key={"header"} className="header-section"></div>);
        }
        mainContent.push(<div key={"wrapper"} className="wrapper">{this.getCurrentView()}</div>);

        return <div>
            <Banner key={"banner"} signUp={this.signUp} user={this.stateManager.user} logout={this.stateManager.signOut} loggedIn={this.state.loggedIn} completeGoogleLogin={this.stateManager.completeGoogleLogin} onPageChange={this.onPageChange} title="Project Dented Lotus" />
            {mainContent}
        </div>;

    }
}