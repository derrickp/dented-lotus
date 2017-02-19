import * as React from "react";
import * as ReactDOM from "react-dom";

import { Banner } from "./Banner";
import { UserComponent } from "./User";
import { StateManager } from "../StateManager";
import { BlogComponent } from "./BlogComponent";
import { HeaderSection } from "./HeaderSection";
import { RaceCountdown } from "./widgets/RaceCountdown";
import { RacePage, AllRaces } from "./Pages";
import { PropsBase } from "../utilities/ComponentUtilities";
import { getUrlParameters } from "../utilities/PageUtilities"

export interface DentedLotusProps extends PropsBase {

}
export class DentedLotus extends React.Component<DentedLotusProps, any>{
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
        this.state = { parameters: parameters, sidebarOpen: false };
    }

    onMenuClicked() {
        this.setState({ sidebarOpen: true });
    }

    onSetSidebarOpen() {
        this.setState({ sidebarOpen: true });
    }

    launchRacePicks() {
        let parameters = this.state.parameters;
        parameters.page = "race";
        this.setState({ parameters: parameters, race: this.stateManager.getNextRace() });
    }

    getCurrentView() {
        switch (this.state.parameters.page) {
            case "race":
                return <RacePage race={this.state.race} small={false} ></RacePage>;
            case "user":
                return <div>User!!!!</div>;
            case "all-races":
                return <AllRaces races={this.stateManager.races} />;
            default:
                return this.getHomePage();
        }
    }

    getHomePage(){
        return <div>
                    <RaceCountdown onclick={this.launchRacePicks.bind(this)} stateManager={this.stateManager} displayName={this.stateManager.nextRace.displayName} cutoffDate={this.stateManager.nextRace.date} />
                    <BlogComponent stateManager={this.stateManager} />
                </div>;
    }

    render() {
        return <div>
            <Banner stateManager={this.stateManager} title="Project Dented Lotus" onMenuClicked={this.onMenuClicked} />
            <HeaderSection stateManager={this.stateManager} />
            <div className="wrapper">
                {this.getCurrentView()}
            </div>
        </div>
    }
}