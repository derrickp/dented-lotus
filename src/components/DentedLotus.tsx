import * as React from "react";
import * as ReactDOM from "react-dom";
import {Grid, Row, Col} from "react-bootstrap";
import { Banner } from "./Banner";
import { UserComponent } from "./User";
import { StateManager } from "../StateManager";
import { BlogsComponent } from "./BlogsComponent";
import { RaceCountdown } from "./widgets/RaceCountdown";
import { RacePage, AllRaces, TrackPage, Tracks, Drivers, Pages, AllSeasonPicks } from "./Pages";
import { RaceModel } from "../../common/models/Race";
import { TeamModel } from "../../common/models/Team";
import { DriverModel } from "../../common/models/Driver";
import { BlogResponse } from "../../common/models/Blog";
import { PredictionModel } from "../../common/models/Prediction";
import { getUrlParameters } from "../utilities/PageUtilities";
import { User } from "../../common/models/User";
import {Scoreboard} from "./widgets/Scoreboard";
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
    allSeasonPredictions: PredictionModel[];
    haveGoogleApi: boolean;
    haveFacebookApi: boolean;
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
            blogs: [],
            allSeasonPredictions: [],
            haveGoogleApi: this.stateManager.googleLoaded,
            haveFacebookApi: this.stateManager.fbLoaded
        };
        this.launchNextRacePicks = this.launchNextRacePicks.bind(this);
        this.changePage = this.changePage.bind(this);
        this.changeRace = this.changeRace.bind(this);
        this.launchAllSeasonPicks = this.launchAllSeasonPicks.bind(this);
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

        this.stateManager.watch("googleLogin", () => {
            this.setState({ haveGoogleApi: true });
        });

        this.stateManager.watch("facebookLogin", () => {
            this.setState({ haveFacebookApi: true });
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

    launchNextRacePicks() {
        let parameters = this.state.parameters;
        parameters.page = Pages.RACE;
        this.stateManager.nextRace.then(race => {
            return this.stateManager.getRace(race.key);
        }).then(race => {
            this.setState({ parameters: parameters, race: race });
        });
    }

    launchAllSeasonPicks() {
        const parameters = this.state.parameters;
        parameters.page = Pages.ALL_SEASON_PICKS;
        this.setState({ parameters: parameters });
        this.stateManager.allSeasonPredictions.then(allSeasonPredictions => {
            this.setState({ allSeasonPredictions: allSeasonPredictions });
        });
    }

    changePage(page: string) {
        const parameters = this.state.parameters;
        parameters.page = page;
        this.setState({ parameters: parameters });
    }

    changeRace(race: RaceModel) {
        const parameters = this.state.parameters;
        parameters.page = Pages.RACE;
        this.stateManager.getRace(race.key).then(refreshedRace => {
            this.setState({ parameters: parameters, race: refreshedRace });
        });
    }

    getCurrentView() {
        switch (this.state.parameters.page) {
            case Pages.RACE:
                return <RacePage race={this.state.race} small={false} isAdmin={this.stateManager.user.isAdmin}></RacePage>;
            // return <div></div>;
            case Pages.USER:
                return <div>User!!!!</div>;
            case Pages.ALL_RACES:
                return <AllRaces raceClick={this.changeRace} races={this.state.races} selectedRace={this.state.race} />;
            case Pages.TRACKS:
                return <Tracks tracks={this.stateManager.tracks} />;
            case Pages.DRIVERS:
                return <Drivers drivers={this.state.drivers} teams={this.state.teams} userIsAdmin={true} createDriver={this.stateManager.createDriver} createTeam={this.stateManager.createTeam} />
            case Pages.ALL_SEASON_PICKS:
                return <AllSeasonPicks predictions={this.state.allSeasonPredictions} />
            default:
                return this.getHomePage();
        }
    }

    getHomePage() { 
        return <div>
            {this.stateManager.isLoggedIn && <RaceCountdown key={1} clickMakeAllSeasonPicks={this.launchAllSeasonPicks} clickMakeNextRacePicks={this.launchNextRacePicks} race={this.stateManager.nextRace} />}
            <Grid>
                <Row>
                    <Col xs={12} mdPush={9} md={3}><Scoreboard stateManager={this.stateManager} type="users" title="Standings" count={5} /></Col>
                    <Col xs={12} mdPull={3} md={9}><BlogsComponent key={2} blogs={this.state.blogs} numberBlogs={3} /></Col>
                </Row>
            </Grid>
        </div>
    }

    render() {
        let mainContent: JSX.Element[] = [];
        if (this.state.parameters.page === Pages.HOME) {
            mainContent.push(<div key={"header"} className="header-section"></div>);
        }
        mainContent.push(<div key={"wrapper"} className="wrapper">{this.getCurrentView()}</div>);
        const googleLogin = this.state.haveGoogleApi ? this.stateManager.doGoogleLogin : null;
        const fbLogin = this.state.haveFacebookApi ? this.stateManager.doFacebookLogin : null;
        return <div>
            <Banner key={"banner"} doFacebookLogin={fbLogin} user={this.stateManager.user} logout={this.stateManager.signOut} loggedIn={this.state.loggedIn} doGoogleLogin={googleLogin} changePage={this.changePage} title="Project Dented Lotus" />
            {mainContent}
        </div>;

    }
}