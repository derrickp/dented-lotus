import * as React from "react";
import * as ReactDOM from "react-dom";
import { TrackResponse as TrackModel } from "../../../common/models/Track";
import { TrackPage } from "./TrackPage";

export interface TracksProps {
    tracks: TrackModel[];
}

export interface TracksState {
}

export class Tracks extends React.Component<TracksProps, TracksState> {
    constructor(props: TracksProps) {
        super(props);

        const tracks = this.props.tracks.sort((track1, track2) => {
            return track1.name.localeCompare(track2.name);
        });

        this.state = { };
    }

    render() {
        if (!this.props.tracks.length) {
            return <div>Loading...</div>;
        }
        const entries = this.props.tracks.sort((track1, track2) => {
            return track1.name.localeCompare(track2.name);
        }).map(track => {
            return <li key={track.key} className="dl-panel"><TrackPage key={track.key} track={track} small={true} /></li>
        });
        return <ul>{entries}</ul>
    }
}