'use strict';

import { IRouteConfiguration } from "hapi";
import * as Boom from "boom";
import { getTracks, saveTracks, getTrackResponses } from "../utilities/data/tracks";
import { TrackResponse } from "../../common/models/Track";

export const trackRoutes: IRouteConfiguration[] = [
    {
        method: 'GET',
        path: '/tracks/{key?}',
        config: {
            cors: true,
            handler: async (request, reply: (tracks: TrackResponse[] | Boom.BoomError) => void) => {
                try {
                    const keys = request.params["key"] ? [request.params["key"]] : [];
                    const tracks = await getTrackResponses(keys);
                    reply (tracks);
                } catch (exception) {
                    reply(Boom.badRequest(exception));
                }
            }
        }
    },
    {
        method: "POST",
        path: "/tracks",
        config: {
            cors: true,
            handler: (request, reply) => {
                const tracks: TrackResponse[] = request.payload;
                tracks.forEach(track => {
                    if (!track.name) {
                        reply(Boom.badRequest("need a track name"));
                        return;
                    }
                    if (!track.key) track.key = track.name.replace(/\s+/g, '-').toLowerCase();
                });
                saveTracks(tracks).then(success => {
                    return getTracks();
                }).then(tracks => {
                    reply(tracks).code(201);
                }).catch((error: Error) => {
                    reply(Boom.badRequest(error.message));
                });
            }
        }
    }
]