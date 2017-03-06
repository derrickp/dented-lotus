'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var sqliteUtilities_1 = require("../utilities/sqliteUtilities");
exports.raceRoutes = [
    {
        method: 'GET',
        path: '/races/{season}/{key?}',
        config: {
            cors: true,
            handler: function (request, reply) {
                sqliteUtilities_1.getRaces(request.params["season"], request.params["key"]).then(function (races) {
                    reply(races);
                });
            }
        }
    }
];
