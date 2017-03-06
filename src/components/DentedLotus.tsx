import * as React from "react";
import * as ReactDOM from "react-dom";

import { Banner } from "./Banner";
import { UserComponent } from "./User";
import { StateManager } from "../StateManager";
import { BlogComponent } from "./BlogComponent";
import { RaceCountdown } from "./widgets/RaceCountdown";
import { RacePage, AllRaces, TrackPage, Tracks, Drivers,Pages } from "./Pages";
import { Race } from "../../common/models/Race";
import { PropsBase } from "../utilities/ComponentUtilities";
import { getUrlParameters } from "../utilities/PageUtilities";
import { GoogleUser } from "../../common/models/User";

import { GoogleLoginResponse } from "../../common/models/GoogleLoginResponse";

export interface DentedLotusProps extends PropsBase {

}

export interface DentedLotusState {
    parameters: any;
    sidebarOpen: boolean;
    race: Promise<Race>;
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
        
        window.addEventListener("google-login-success", (args: CustomEvent) => {
            this.onGoogleLogin(args.detail); 
        });
    }
    

    onGoogleLogin(args: GoogleLoginResponse) {
        // this.hide();
        this.stateManager.setUser(new GoogleUser(args));
        this.setState({ loggedIn: this.stateManager.isLoggedIn });
        // this.setState({ loggedIn: true });
    }

    onMenuClicked() {
        this.setState({ sidebarOpen: true });
    }

    onSetSidebarOpen() {
        this.setState({ sidebarOpen: true });
    }

    launchRacePicks() {
        let parameters = this.state.parameters;
        parameters.page = Pages.RACE;
        this.setState({ parameters: parameters, race: this.stateManager.getNextRace() });
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
                return <Drivers drivers={this.stateManager.drivers} userIsAdmin={true} />
            default:
                return this.getHomePage();
        }
    }

    getHomePage() {
        return <div>
            <RaceCountdown onclick={this.launchRacePicks.bind(this)} stateManager={this.stateManager} displayName={this.stateManager.nextRace.displayName} cutoffDate={this.stateManager.nextRace.date} />
            <BlogComponent stateManager={this.stateManager} />
        </div>;
    }

    render() {
        return <div>
            <Banner loggedIn={this.state.loggedIn} onGoogleLogin={this.onGoogleLogin.bind(this)} onPageChange={this.onPageChange.bind(this)} stateManager={this.stateManager} title="Project Dented Lotus" />
            <div className="wrapper">
                {this.getCurrentView()}
            </div>
        </div>
    }
}