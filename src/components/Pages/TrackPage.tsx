import * as React from "react";
import * as ReactDOM from "react-dom";
import { TrackModel } from "../../../common/models/Track";

export interface TrackProps {
    track: TrackModel;
    small: boolean;
}

export interface TrackState {
    small: boolean;
}

export class TrackPage extends React.Component<TrackProps, TrackState> {
    track: TrackModel;

    constructor(props: TrackProps) {
        super(props);
        this.state = {
            small: this.props.small
        };
    }

    toggleSize() {
        let size = this.state.small;
        this.setState({ small: !size });
    }

    getSmall() {
        return <div onClick={this.toggleSize.bind(this)} className="dl-panel">
            <div>{this.props.track.trackResponse.name} - SMALL</div>
            <div>{this.props.track.trackResponse.country}</div>
        </div>;
    }

    getFull() {
        return <div onClick={this.toggleSize.bind(this)} className="dl-panel">
            <div>{this.props.track.trackResponse.name}</div>
            <div>{this.props.track.trackResponse.country}</div>
        </div>;
    }

    render() {
        if (!this.props.track) {
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