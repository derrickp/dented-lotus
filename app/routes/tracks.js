'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var sqliteUtilities_1 = require("../utilities/sqliteUtilities");
exports.trackRoutes = [
    {
        method: 'GET',
        path: '/tracks/{key?}',
        config: {
            cors: true,
            handler: function (request, reply) {
                sqliteUtilities_1.getTracks(parseInt(request.params["key"])).then(function (tracks) {
                    reply(tracks);
                });
            }
        }
    }
];
