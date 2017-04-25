import * as React from "react";
import * as ReactDOM from "react-dom";
import { Grid, Row, Col } from "react-bootstrap";

import { Route, RouteComponentProps } from "react-router-dom";
import { RouterChildContext } from "react-router";

import { Banner } from "./widgets/Banner";
import { AppManager } from "../AppManager";
import { RaceCountdown } from "./widgets/RaceCountdown";
import { RacePage, AllRaces, TrackPage, Tracks, Drivers, AllSeasonPicks, Blogs, Profile, RaceAdmin, GeneralAdmin } from "./Pages";
import { Paths } from "./../Paths";
import { RaceModel } from "../../common/models/Race";
import { TeamModel } from "../../common/models/Team";
import { DriverModel } from "../../common/models/Driver";
import { TrackModel } from "../../common/models/Track";
import { BlogResponse } from "../../common/responses/BlogResponse";
import { PredictionModel } from "../../common/models/Prediction";
import { User } from "../../common/models/User";
import { PublicUser } from "../../common/responses/PublicUser";
import { Scoreboard } from "./widgets/scoreboards/Scoreboard";
import { CircularProgress } from "material-ui";

export interface DentedLotusProps {
    stateManager: AppManager;
}

interface Parameters {
    page: string;
}

export interface DentedLotusState {
    sidebarOpen: boolean;
    loggedIn: boolean;
    signUpMethod?: string;
    teams: TeamModel[];
    races: RaceModel[];
    race: RaceModel;
    drivers: DriverModel[];
    blogs: BlogResponse[];
    tracks: TrackModel[];
    allSeasonPredictions: PredictionModel[];
    publicUsers: PublicUser[];
    user: User;
    haveGoogleApi: boolean;
    haveFacebookApi: boolean;
    currentPredictions: PredictionModel[];
    working: Boolean;
}

export class DentedLotus extends React.Component<DentedLotusProps, DentedLotusState>{
    private _mounted: boolean = false;
    /**
     *
     */
    app:AppManager;

    context: RouterChildContext<any>;
    static contextTypes: React.ValidationMap<any> = {
        router: React.PropTypes.object.isRequired
    };

    constructor(props: DentedLotusProps, context: RouterChildContext<any>) {
        super(props);
        this.app = this.props.stateManager;
        this.context = context;
        this.state = {
            loggedIn: this.props.stateManager.isLoggedIn,
            race: null,
            sidebarOpen: false,
            drivers: this.props.stateManager.drivers,
            races: this.props.stateManager.races,
            teams: this.props.stateManager.teams,
            blogs: this.props.stateManager.blogs,
            tracks: this.props.stateManager.tracks,
            publicUsers: this.props.stateManager.publicUsers,
            allSeasonPredictions: [],
            user: this.props.stateManager.user,
            haveGoogleApi: this.props.stateManager.googleLoaded,
            haveFacebookApi: this.props.stateManager.fbLoaded,
            currentPredictions: this.props.stateManager.currentPredictions,
            working: false
        };
        this.launchNextRacePicks = this.launchNextRacePicks.bind(this);
        this.launchAllSeasonPicks = this.launchAllSeasonPicks.bind(this);
        this.changeRace = this.changeRace.bind(this);
        this.changePage = this.changePage.bind(this);
        this.clickUser = this.clickUser.bind(this);
        this.scoreRace = this.scoreRace.bind(this);

        this.props.stateManager.watch("user", () => {
            this.setState({ user: this.props.stateManager.user });
            this.onUserChange();
        });

        this.props.stateManager.watch("working", (working: boolean) => {
            this.setState({ working: working });
        })

        this.props.stateManager.watch("currentPredictions", () => {
            this.setState({ currentPredictions: this.props.stateManager.currentPredictions });
        });

        this.props.stateManager.watch("races", () => {
            this.setState({ races: this.props.stateManager.races });
        });

        this.props.stateManager.watch("teams", () => {
            this.setState({ teams: this.props.stateManager.teams });
        });

        this.props.stateManager.watch("drivers", () => {
            this.setState({ drivers: this.props.stateManager.drivers });
        });

        this.props.stateManager.watch("tracks", () => {
            this.setState({ tracks: this.props.stateManager.tracks });
        });

        this.props.stateManager.watch("googleLogin", () => {
            if (this._mounted) this.setState({ haveGoogleApi: true });
        });

        this.props.stateManager.watch("facebookLogin", () => {
            if (this._mounted) this.setState({ haveFacebookApi: true });
        });

        this.props.stateManager.watch("blogs", () => {
            this.setState({ blogs: this.props.stateManager.blogs });
        });

        this.props.stateManager.watch("publicUsers", () => {
            this.setState({ publicUsers: this.props.stateManager.publicUsers });
        });
    }

    componentDidMount() {
        this._mounted = true;
        this.onUserChange();
    }

    onUserChange() {
        const loggedIn = this.props.stateManager.isLoggedIn;
        this.setState({ loggedIn: loggedIn });
    }

    clickUser(publicUser: PublicUser) {
        this.props.stateManager.refreshUser(publicUser.key).then(() => {
            this.context.router.history.push(`${Paths.PROFILE}:${publicUser.key}`);
        }).catch((error: Error) => {
            alert(error.message);
        });
    }

    launchNextRacePicks() {
        this.changeRace(this.props.stateManager.nextRace);
    }

    launchAllSeasonPicks() {
        this.props.stateManager.allSeasonPredictions.then(allSeasonPredictions => {
            this.setState({ allSeasonPredictions: allSeasonPredictions });
        });
    }

    changePage(page: string) {
        switch (page) {
            case Paths.BLOGS:
                this.props.stateManager.refreshBlogs().then(() => {
                    this.context.router.history.push(page);
                });
                break;
            case Paths.PREDICTIONS_ADMIN:
                this.props.stateManager.refreshRaces().then(() => {
                    this.context.router.history.push(page);
                });
                break;
            case Paths.PROFILE:
                this.context.router.history.push(page + ":");
                break;
            default:
                this.context.router.history.push(page);
                break;
        }
    }

    changeRace(race: RaceModel) {
        const promises: Promise<any>[] = [];
        promises.push(this.props.stateManager.refreshPredictions(race.key));
        // promises.push(this.props.stateManager.refreshRace(race.key));
        Promise.all(promises).then(() => {
            this.context.router.history.push(`/single-race:${race.key}`);
        });
    }

    scoreRace(race: RaceModel): void {
        this.props.stateManager.refreshRace(race.key).then(refreshedRace => {
            this.setState({ race: refreshedRace });
        });
    }

    getSpinner(): JSX.Element {
        if (!this.state.working) {
            return null;
        }
        return <div className="spinner-modal-background">
                <CircularProgress />
            </div>

    }

    render() {
        const googleLogin = this.props.stateManager.googleLoaded ? this.props.stateManager.doGoogleLogin : null;
        const fbLogin = this.props.stateManager.fbLoaded ? this.props.stateManager.doFacebookLogin : null;
        const spinner = this.getSpinner();
        return <div>
            {spinner}
            <Banner key={"banner"} doFacebookLogin={fbLogin} user={this.props.stateManager.user} logout={this.props.stateManager.signOut} loggedIn={this.state.loggedIn} doGoogleLogin={googleLogin} changePage={this.changePage} title="Project Dented Lotus" />
            <Route exact={true} path={Paths.HOME} render={() => <Home app={this.app} race={this.props.stateManager.nextRace} publicUsers={this.state.publicUsers} blogs={this.state.blogs} drivers={this.state.drivers} isLoggedIn={this.props.stateManager.isLoggedIn} user={this.state.user} clickUser={this.clickUser} launchAllSeasonPicks={this.launchAllSeasonPicks} launchNextRacePicks={this.launchNextRacePicks} ></Home>} />
            <Route exact={true} path={Paths.BLOGS} render={() => <Blogs numBlogs={-1} blogs={this.state.blogs} title="Blogs" fromHomePanel={false} saveNewBlog={this.props.stateManager.saveBlog} showAddButton={this.props.stateManager.isLoggedIn}></Blogs>} />
            <Route exact={true} path={Paths.DRIVERS} render={() => <Drivers drivers={this.state.drivers} teams={this.state.teams} userIsAdmin={this.props.stateManager.user && this.props.stateManager.user.isAdmin} createDriver={this.props.stateManager.createDriver} createTeam={this.props.stateManager.createTeam} />} />
            <Route exact={true} path={Paths.GENERAL_ADMIN} render={() => <GeneralAdmin callEndpoint={this.props.stateManager.adminSendToEndpoint} races={this.state.races} drivers={this.state.drivers} teams={this.state.teams}></GeneralAdmin>} />
            <Route exact={true} path={Paths.PROFILE + ":id"} render={(props: RouteComponentProps<any>) => {
                const id = props.match.url.split(":")[1];
                let user: User;

                // If the user is the current one, grab the full thing.
                if (id === this.props.stateManager.user.key) {
                    user = this.props.stateManager.user;
                }
                // Otherwise get it from the store
                else {
                    user = this.props.stateManager.getUser(id);
                }
                return <Profile drivers={this.state.drivers} teams={this.state.teams} user={user} thisUser={this.props.stateManager.user}></Profile>;
            }} />
            <Route exact={true} path={Paths.TRACKS} render={() => <Tracks tracks={this.state.tracks} />} />
            <Route exact={true} path={Paths.ALL_RACES} render={() => <AllRaces raceClick={this.changeRace} races={this.state.races} selectedRace={this.state.race} userIsAdmin={this.props.stateManager.userIsAdmin()} scoreRace={this.scoreRace} />} />
            <Route exact={true} path={Paths.RACE + ":id"} render={(props: RouteComponentProps<any>) => {
                const id = props.match.url.split(":")[1];
                const race = this.props.stateManager.getRace(id);
                return <RacePage race={race} predictions={this.state.currentPredictions} small={false} isAdmin={this.props.stateManager.user.isAdmin}></RacePage>;
            }} />
            <Route exact={true} path={Paths.ALL_SEASON_PICKS} render={() => <AllSeasonPicks predictions={this.state.allSeasonPredictions} />} />
        </div>;
    }
}

export interface HomeProps {
    isLoggedIn: boolean;
    blogs: BlogResponse[];
    user: User;
    launchAllSeasonPicks: () => void;
    launchNextRacePicks: () => void;
    race: RaceModel;
    clickUser: (publicUser: PublicUser) => void;
    publicUsers: PublicUser[];
    drivers: DriverModel[];
}

export const Home = (props: HomeProps) => (
    <div>
        <div key={"header"} className="header-section"></div>
        <Grid fluid={true}>
            <RaceCountdown isLoggedIn={props.isLoggedIn} key={1} clickMakeAllSeasonPicks={props.launchAllSeasonPicks} clickMakeNextRacePicks={props.launchNextRacePicks} race={props.race} />
            <Row>
                <Col xs={12} mdPush={8} md={4}><Scoreboard clickItem={props.clickUser} publicUsers={props.publicUsers} drivers={props.drivers} user={props.user} type="users" title="Standings" count={props.publicUsers.length} /></Col>
                <Col xs={12} mdPull={4} md={8}><Blogs key={2} blogs={props.blogs} fromHomePanel={true} showAddButton={false} saveNewBlog={null} numBlogs={3} /></Col>
            </Row>
        </Grid>
    </div>
);