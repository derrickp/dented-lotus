import { TrackModel } from "../../../common/models/Track";
import { TrackPage } from "./TrackPage";
import {DentedLotusComponentBase, DentedLotusProps, React,ReactDOM} from "../../DefaultImports"; 

export interface TracksProps extends DentedLotusProps {
    tracks: TrackModel[];
}

export interface TracksState {
}

export class Tracks extends DentedLotusComponentBase<TracksProps, TracksState> {
    constructor(props: TracksProps) {
        super(props);

        const tracks = this.props.tracks.sort((track1, track2) => {
            return track1.trackResponse.name.localeCompare(track2.trackResponse.name);
        });

        this.state = { };
    }

    render() {
        if (!this.props.tracks.length) {
            return <div>Loading...</div>;
        }
        const entries = this.props.tracks.sort((track1, track2) => {
            return track1.trackResponse.name.localeCompare(track2.trackResponse.name);
        }).map(track => {
            return <li key={track.key} className="dl-panel"><TrackPage app={this.app} key={track.key} track={track} small={true} /></li>
        });
        return <ul>{entries}</ul>
    }
}