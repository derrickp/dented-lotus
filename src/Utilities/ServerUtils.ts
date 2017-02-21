
import { Track } from "../models/Track";

const baseUrl = window.location.origin;

export function getAllTracks(): Promise<Track[]> {
    return new Promise<Track[]>((resolve, reject) => {
        return fetch(baseUrl + "/tracks").then(response => {
            return response.json().then((tracks: Track[]) => {
                resolve(tracks);
            });
        });
    });
}