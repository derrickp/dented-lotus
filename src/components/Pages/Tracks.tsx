import * as React from "react";
import * as ReactDOM from "react-dom";
import { TrackResponse as TrackModel } from "../../../common/models/Track";
import { TrackPage } from "./TrackPage";

export interface TracksProps {
    tracks: Promise<TrackModel[]>;
}

export interface TracksState {
    tracks: TrackModel[];
}

export class Tracks extends React.Component<TracksProps, TracksState> {
    constructor(props: TracksProps) {
        super(props);
        this.state = {
            tracks: []
        };
        this.props.tracks.then(tracks => {
            tracks.sort((track1, track2) => {
                if (track1.name < track2.name) {
                    return -1;
                }
                if (track1.name > track2.name) {
                    return 1;
                }
                return 0;
            });
            this.setState({tracks: tracks});
        });
    }

    render() {
        if (!this.state.tracks.length) {
            return <div>Loading...</div>;
        }
        const entries = this.state.tracks.map(track => {
            return <li key={track.key} className="dl-panel"><TrackPage key={track.key} track={track} small={true}/></li>
        });
        return <ul>{entries}</ul>
    }
}