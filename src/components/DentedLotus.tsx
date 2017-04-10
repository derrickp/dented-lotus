import * as React from "react";
import * as ReactDOM from "react-dom";
import { Grid, Row, Col } from "react-bootstrap";
import { Banner } from "./Banner";
import { UserComponent } from "./User";
import { StateManager } from "../StateManager";
import { RaceCountdown } from "./widgets/RaceCountdown";
import { RacePage, AllRaces, TrackPage, Tracks, Drivers, Pages, AllSeasonPicks, Blogs, Profile, RaceAdmin } from "./Pages";
import { RaceModel } from "../../common/models/Race";
import { TeamModel } from "../../common/models/Team";
import { DriverModel } from "../../common/models/Driver";
import { TrackResponse, TrackModel } from "../../common/models/Track";
import { BlogResponse } from "../../common/models/Blog";
import { PredictionModel } from "../../common/models/Prediction";
import { getUrlParameters } from "../utilities/PageUtilities";
import { User, PublicUser } from "../../common/models/User";
import { Scoreboard } from "./widgets/Scoreboard";

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
    tracks: TrackResponse[];
    allSeasonPredictions: PredictionModel[];
    publicUsers: PublicUser[];
    user: User;
    haveGoogleApi: boolean;
    haveFacebookApi: boolean;
    viewUser: User;
}

export class DentedLotus extends React.Component<DentedLotusProps, DentedLotusState>{
    stateManager: StateManager;
    private _mounted: boolean = false;
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
            tracks: [],
            publicUsers: [],
            allSeasonPredictions: [],
            user: null,
            haveGoogleApi: this.stateManager.googleLoaded,
            haveFacebookApi: this.stateManager.fbLoaded,
            viewUser: null
        };

        this.launchNextRacePicks = this.launchNextRacePicks.bind(this);
        this.launchAllSeasonPicks = this.launchAllSeasonPicks.bind(this);
        this.changeRace = this.changeRace.bind(this);
        this.changePage = this.changePage.bind(this);
        this.clickUser = this.clickUser.bind(this);
        this.returnHome = this.returnHome.bind(this);
        this.scoreRace = this.scoreRace.bind(this);

        this.stateManager.watch("user", () => {
            this.setState({ user: this.stateManager.user });
            this.onUserChange();
        });

        this.stateManager.watch("races", () => {
            this.setState({ races: this.stateManager.races });
        });

        this.stateManager.watch("teams", () => {
            this.setState({ teams: this.stateManager.teams });
        });

        this.stateManager.watch("drivers", () => {
            this.setState({ drivers: this.stateManager.drivers });
        });

        this.stateManager.watch("tracks", () => {
            this.setState({ tracks: this.stateManager.tracks });
        });

        this.stateManager.watch("googleLogin", () => {
            if (this._mounted) this.setState({ haveGoogleApi: true });
        });

        this.stateManager.watch("facebookLogin", () => {
            if (this._mounted) this.setState({ haveFacebookApi: true });
        });

        this.stateManager.watch("blogs", () => {
            this.setState({ blogs: this.stateManager.blogs });
        });

        this.stateManager.watch("publicUsers", () => {
            this.setState({ publicUsers: this.stateManager.publicUsers });
        });

        this.stateManager.initialize();
    }

    componentDidMount() {
        this._mounted = true;
        this.onUserChange();
    }

    onUserChange() {
        const loggedIn = this.stateManager.isLoggedIn;
        if (!loggedIn) {
            let parameters = this.state.parameters;
            parameters.page = Pages.HOME;
            this.setState({ loggedIn: loggedIn, parameters: parameters });
        } else {
            this.stateManager.refreshRaces();
            this.setState({ loggedIn: loggedIn });
        }
    }

    clickUser(publicUser: PublicUser) {
        const parameters = this.state.parameters;
        parameters.page = Pages.PROFILE;
        this.stateManager.getUser(publicUser.key).then(user => {
            this.setState({ viewUser: user, parameters: parameters });
        }).catch((error: Error) => {
            alert(error.message);
        });
    }

    launchNextRacePicks() {
        let parameters = this.state.parameters;
        parameters.page = Pages.RACE;
        this.stateManager.getRace(this.stateManager.nextRace.key).then(raceModel => {
            this.setState({ parameters: parameters, race: raceModel });
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

        switch (page) {
            case Pages.BLOGS:
                this.stateManager.refreshBlogs().then(() => {
                    this.setState({ parameters: parameters });
                });
                break;
            case Pages.PREDICTIONS_ADMIN:
                this.stateManager.refreshRaces().then(() => {
                    this.setState({ parameters: parameters });
                });
                break;
            case Pages.PROFILE:
                this.setState({viewUser: null, parameters: parameters});
                break;
            default:
                this.setState({ parameters: parameters });
                break;
        }
    }

    changeRace(race: RaceModel) {
        const parameters = this.state.parameters;
        parameters.page = Pages.RACE;
        this.stateManager.getRace(race.key).then(refreshedRace => {
            this.setState({ parameters: parameters, race: refreshedRace });
        });
    }

    returnHome() {
        const parameters = this.state.parameters;
        parameters.page = Pages.HOME;
        this.setState({ parameters: parameters });
    } 

    scoreRace(race:RaceModel):void{
        const parameters = this.state.parameters;
        parameters.page = Pages.RACE_ADMIN;
        this.stateManager.getRace(race.key).then(refreshedRace => {
            this.setState({ parameters: parameters, race: refreshedRace });
        });
    }

    getCurrentView() {
        switch (this.state.parameters.page) {
            case Pages.RACE:
                return <RacePage race={this.state.race} small={false} isAdmin={this.stateManager.user.isAdmin}></RacePage>;
            case Pages.RACE_ADMIN:
                return <RaceAdmin race={this.state.race} returnHome={this.returnHome} id_token={this.stateManager.user.id_token}></RaceAdmin>;
            case Pages.BLOGS:
                return <Blogs numBlogs={-1} blogs={this.state.blogs} title="Blogs" fromHomePanel={false} saveNewBlog={this.stateManager.saveBlog} showAddButton={this.stateManager.isLoggedIn}></Blogs>
            case Pages.USER:
                return <div>User!!!!</div>;
            case Pages.ALL_RACES:
                return <AllRaces raceClick={this.changeRace} races={this.state.races} selectedRace={this.state.race}  userIsAdmin={this.stateManager.userIsAdmin()} scoreRace={this.scoreRace}/>;
            case Pages.TRACKS:
                return <Tracks tracks={this.state.tracks} />;
            case Pages.DRIVERS:
                return <Drivers drivers={this.state.drivers} teams={this.state.teams} userIsAdmin={this.stateManager.user && this.stateManager.user.isAdmin} createDriver={this.stateManager.createDriver} createTeam={this.stateManager.createTeam} />
            case Pages.ALL_SEASON_PICKS:
                return <AllSeasonPicks predictions={this.state.allSeasonPredictions} />
            case Pages.PROFILE:
                return <Profile drivers={this.state.drivers} teams={this.state.teams} user={this.state.viewUser} thisUser={this.stateManager.user}></Profile>
            case Pages.PREDICTIONS_ADMIN:
                return <div>Predictions Admin</div>;
            default:
                return this.getHomePage();
        }
    }

    getHomePage() {
        return <div>
            <Grid>
            {this.stateManager.isLoggedIn && <RaceCountdown key={1} clickMakeAllSeasonPicks={this.launchAllSeasonPicks} clickMakeNextRacePicks={this.launchNextRacePicks} race={this.stateManager.nextRace} />}
                <Row>
                    <Col xs={12} mdPush={8} md={4}><Scoreboard clickItem={this.clickUser} publicUsers={this.state.publicUsers} drivers={this.state.drivers} user={this.state.user} type="users" title="Standings" count={this.state.publicUsers.length} /></Col>
                    <Col xs={12} mdPull={4} md={8}><Blogs key={2} blogs={this.state.blogs} fromHomePanel={true} showAddButton={false} saveNewBlog={null} numBlogs={3} /></Col>
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
        const googleLogin = this.stateManager.googleLoaded ? this.stateManager.doGoogleLogin : null;
        const fbLogin = this.stateManager.fbLoaded ? this.stateManager.doFacebookLogin : null;
        return <div>
            <Banner key={"banner"} doFacebookLogin={fbLogin} user={this.stateManager.user} logout={this.stateManager.signOut} loggedIn={this.state.loggedIn} doGoogleLogin={googleLogin} changePage={this.changePage} title="Project Dented Lotus" />
            {mainContent}
        </div>;
    }
}