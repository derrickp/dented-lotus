import * as React from "react";
import * as ReactDOM from "react-dom";
import { Grid, Row, Col } from "react-bootstrap";

import { Route, RouteComponentProps } from "react-router-dom";
import { RouterChildContext } from "react-router";

import { DentedLotusComponentBase } from "../interfaces/DentedLotusComponentBase";
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
    app: AppManager;
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

export class DentedLotus extends DentedLotusComponentBase<DentedLotusProps, DentedLotusState>{
    private _mounted: boolean = false;
    context: RouterChildContext<any>;
    static contextTypes: React.ValidationMap<any> = {
        router: React.PropTypes.object.isRequired
    };

    constructor(props: DentedLotusProps, context: RouterChildContext<any>) {
        super(props);
        this.app = this.props.app;
        this.context = context;
        this.state = {
            loggedIn: this.props.app.isLoggedIn,
            race: null,
            sidebarOpen: false,
            drivers: this.props.app.drivers,
            races: this.props.app.races,
            teams: this.props.app.teams,
            blogs: this.props.app.blogs,
            tracks: this.props.app.tracks,
            publicUsers: this.props.app.publicUsers,
            allSeasonPredictions: [],
            user: this.props.app.user,
            haveGoogleApi: this.props.app.googleLoaded,
            haveFacebookApi: this.props.app.fbLoaded,
            currentPredictions: this.props.app.currentPredictions,
            working: false
        };
        this.launchNextRacePicks = this.launchNextRacePicks.bind(this);
        this.launchAllSeasonPicks = this.launchAllSeasonPicks.bind(this);
        this.changeRace = this.changeRace.bind(this);
        this.changePage = this.changePage.bind(this);
        this.clickUser = this.clickUser.bind(this);
        this.scoreRace = this.scoreRace.bind(this);

        this.props.app.watch("user", () => {
            this.setState({ user: this.props.app.user });
            this.onUserChange();
        });

        this.props.app.watch("working", (working: boolean) => {
            this.setState({ working: working });
        })

        this.props.app.watch("currentPredictions", () => {
            this.setState({ currentPredictions: this.props.app.currentPredictions });
        });

        this.props.app.watch("races", () => {
            this.setState({ races: this.props.app.races });
        });

        this.props.app.watch("teams", () => {
            this.setState({ teams: this.props.app.teams });
        });

        this.props.app.watch("drivers", () => {
            this.setState({ drivers: this.props.app.drivers });
        });

        this.props.app.watch("tracks", () => {
            this.setState({ tracks: this.props.app.tracks });
        });

        this.props.app.watch("googleLogin", () => {
            if (this._mounted) this.setState({ haveGoogleApi: true });
        });

        this.props.app.watch("facebookLogin", () => {
            if (this._mounted) this.setState({ haveFacebookApi: true });
        });

        this.props.app.watch("blogs", () => {
            this.setState({ blogs: this.props.app.blogs });
        });

        this.props.app.watch("publicUsers", () => {
            this.setState({ publicUsers: this.props.app.publicUsers });
        });
    }

    componentDidMount() {
        this._mounted = true;
        this.onUserChange();
    }

    onUserChange() {
        const loggedIn = this.props.app.isLoggedIn;
        this.setState({ loggedIn: loggedIn });
    }

    clickUser(publicUser: PublicUser) {
        // this.app.showLoadingSpinner();
        this.props.app.refreshUser(publicUser.key).then(() => {
            // this.app.hideLoadingSpinner();
            this.context.router.history.push(`${Paths.PROFILE}:${publicUser.key}`);
        }).catch((error: Error) => {
            alert(error.message);
        });
    }

    launchNextRacePicks() {
        this.changeRace(this.props.app.nextRace);
    }

    launchAllSeasonPicks() {
        this.props.app.allSeasonPredictions.then(allSeasonPredictions => {
            this.setState({ allSeasonPredictions: allSeasonPredictions });
        });
    }

    changePage(page: string) {
        switch (page) {
            case Paths.BLOGS:
                this.props.app.refreshBlogs().then(() => {
                    this.context.router.history.push(page);
                });
                break;
            case Paths.PREDICTIONS_ADMIN:
                this.props.app.refreshRaces().then(() => {
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
        promises.push(this.props.app.refreshPredictions(race.key));
        // promises.push(this.props.app.refreshRace(race.key));
        Promise.all(promises).then(() => {
            this.context.router.history.push(`/single-race:${race.key}`);
        });
    }

    scoreRace(race: RaceModel): void {
        this.props.app.refreshRace(race.key).then(refreshedRace => {
            this.setState({ race: refreshedRace });
        });
    }

    getSpinner(): JSX.Element {
        if (!this.state.working) {
            return null;
        }
        return <div className="spinner-modal-background">
            <CircularProgress style={{
                display: 'block',
                margin: '14% auto auto'
            }} />
        </div>

    }

    render() {
        const googleLogin = this.props.app.googleLoaded ? this.props.app.doGoogleLogin : null;
        const fbLogin = this.props.app.fbLoaded ? this.props.app.doFacebookLogin : null;
        const spinner = this.getSpinner();
        return <div>
            {spinner}
            <Banner key={"banner"} doFacebookLogin={fbLogin} user={this.props.app.user} logout={this.props.app.signOut} loggedIn={this.state.loggedIn} doGoogleLogin={googleLogin} changePage={this.changePage} title="Project Dented Lotus" />
            <Route exact={true} path={Paths.HOME} render={() => <Home app={this.app} race={this.app.nextRace} publicUsers={this.state.publicUsers} blogs={this.state.blogs} drivers={this.state.drivers} isLoggedIn={this.app.isLoggedIn} user={this.state.user} clickUser={this.clickUser} launchAllSeasonPicks={this.launchAllSeasonPicks} launchNextRacePicks={this.launchNextRacePicks} ></Home>} />
            <Route exact={true} path={Paths.BLOGS} render={() => <Blogs app={this.app} numBlogs={-1} blogs={this.state.blogs} title="Blogs" fromHomePanel={false} saveNewBlog={this.props.app.saveBlog} showAddButton={this.props.app.isLoggedIn}></Blogs>} />
            <Route exact={true} path={Paths.DRIVERS} render={() => <Drivers app={this.app} drivers={this.state.drivers} teams={this.state.teams} userIsAdmin={this.props.app.user && this.props.app.user.isAdmin} createDriver={this.props.app.createDriver} createTeam={this.props.app.createTeam} />} />
            <Route exact={true} path={Paths.GENERAL_ADMIN} render={() => <GeneralAdmin app={this.app} callEndpoint={this.props.app.adminSendToEndpoint} races={this.state.races} drivers={this.state.drivers} teams={this.state.teams}></GeneralAdmin>} />
            <Route exact={true} path={Paths.PROFILE + ":id"} render={(props: RouteComponentProps<any>) => {
                const id = props.match.url.split(":")[1];
                let user: User;

                // If the user is the current one, grab the full thing.
                if (id === this.props.app.user.key) {
                    user = this.props.app.user;
                }
                // Otherwise get it from the store
                else {
                    user = this.props.app.getUser(id);
                }
                return <Profile app={this.app} drivers={this.state.drivers} teams={this.state.teams} user={user} thisUser={this.props.app.user}></Profile>;
            }} />
            <Route exact={true} path={Paths.TRACKS} render={() => <Tracks app={this.app} tracks={this.state.tracks} />} />
            <Route exact={true} path={Paths.ALL_RACES} render={() => <AllRaces app={this.app} raceClick={this.changeRace} races={this.state.races} selectedRace={this.state.race} userIsAdmin={this.props.app.userIsAdmin()} scoreRace={this.scoreRace} />} />
            <Route exact={true} path={Paths.RACE + ":id"} render={(props: RouteComponentProps<any>) => {
                const id = props.match.url.split(":")[1];
                const race = this.props.app.getRace(id);
                return <RacePage race={race} app={this.app} predictions={this.state.currentPredictions} small={false} isAdmin={this.props.app.user.isAdmin}></RacePage>;
            }} />
            <Route exact={true} path={Paths.ALL_SEASON_PICKS} render={() => <AllSeasonPicks app={this.app} predictions={this.state.allSeasonPredictions} />} />
        </div>;
    }
}

export interface HomeProps extends DentedLotusProps {
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
                <Col xs={12} mdPull={4} md={8}><Blogs app={props.app} key={2} blogs={props.blogs} fromHomePanel={true} showAddButton={false} saveNewBlog={null} numBlogs={3} /></Col>
            </Row>
        </Grid>
    </div>
);