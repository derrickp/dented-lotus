'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var Boom = require("boom");
var tracks_1 = require("../utilities/data/tracks");
exports.trackRoutes = [
    {
        method: 'GET',
        path: '/tracks/{key?}',
        config: {
            cors: true,
            handler: function (request, reply) {
                tracks_1.getTracks(request.params["key"]).then(function (tracks) {
                    reply(tracks);
                });
            }
        }
    },
    {
        method: "POST",
        path: "/tracks",
        config: {
            cors: true,
            handler: function (request, reply) {
                var tracks = request.payload;
                tracks.forEach(function (track) {
                    if (!track.name) {
                        reply(Boom.badRequest("need a track name"));
                        return;
                    }
                    if (!track.key)
                        track.key = track.name.replace(/\s+/g, '-').toLowerCase();
                });
                tracks_1.saveTracks(tracks).then(function (success) {
                    return tracks_1.getTracks();
                }).then(function (tracks) {
                    console.log(tracks);
                    reply(tracks).code(201);
                }).catch(function (error) {
                    reply(Boom.badRequest(error.message));
                });
            }
        }
    }
];
