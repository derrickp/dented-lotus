import * as React from "react";
import * as ReactDOM from "react-dom";
import { PropsBase } from "../../utilities/ComponentUtilities";
import { TrackResponse as TrackModel } from "../../../common/models/Track";

export interface TrackProps {
    track: TrackModel;
    small: boolean;
}

export interface TrackState {
    track: TrackModel;
    small: boolean;
}

export class TrackPage extends React.Component<TrackProps, TrackState> {
    track: TrackModel;

    constructor(props: TrackProps) {
        super(props);
        this.state = {
            track: props.track,
            small: this.props.small
        };
    }

    toggleSize() {
        let size = this.state.small;
        this.setState({ small: !size });
    }

    getSmall() {
        return <div onClick={this.toggleSize.bind(this)} className="dl-panel">
            <div>{this.state.track.name} - SMALL</div>
            <div>{this.state.track.country}</div>
        </div>;
    }

    getFull() {
        return <div onClick={this.toggleSize.bind(this)} className="dl-panel">
            <div>{this.state.track.name}</div>
            <div>{this.state.track.country}</div>
        </div>;
    }

    render() {
        if (!this.state.track) {
            return <div>Loading... </div>
        } else {
            if (this.state.small) {
                return this.getSmall();
            } else {
                return this.getFull();
            }
        }
    }
}