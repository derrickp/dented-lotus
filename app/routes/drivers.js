'use strict';
var sqliteUtilities_1 = require("../utilities/sqliteUtilities");
exports.driverRoutes = [
    {
        method: 'GET',
        path: '/drivers/{key?}',
        config: {
            cors: true,
            handler: function (request, reply) {
                sqliteUtilities_1.getDrivers(false, request.params["key"]).then(function (drivers) {
                    reply(drivers);
                });
            }
        }
    },
    {
        method: 'GET',
        path: '/drivers/active/{key?}',
        config: {
            cors: true,
            handler: function (request, reply) {
                sqliteUtilities_1.getDrivers(true, request.params["key"]).then(function (drivers) {
                    reply(drivers);
                });
            }
        }
    }
];
