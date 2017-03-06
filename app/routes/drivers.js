'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var Boom = require("boom");
var drivers_1 = require("../utilities/data/drivers");
exports.driverRoutes = [
    {
        method: 'GET',
        path: '/drivers/{key?}',
        config: {
            cors: true,
            handler: function (request, reply) {
                drivers_1.getDrivers(false, request.params["key"]).then(function (drivers) {
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
                drivers_1.getDrivers(true, request.params["key"]).then(function (drivers) {
                    reply(drivers);
                });
            }
        }
    },
    {
        method: "PUT",
        path: "/drivers/{key?}",
        config: {
            cors: true,
            handler: function (request, reply) {
                var driver = request.payload;
                drivers_1.saveDrivers([driver]).then(function (success) {
                    return drivers_1.getDrivers(false, driver.key);
                }).then(function (driver) {
                    reply(driver);
                }).catch(function (error) {
                    reply(Boom.badRequest(error.message)).code(400);
                });
            }
        }
    },
    {
        method: "POST",
        path: "/drivers",
        config: {
            cors: true,
            handler: function (request, reply) {
                var drivers = request.payload;
                drivers.forEach(function (driver) {
                    if (!driver.name) {
                        reply(Boom.badRequest("need a driver name"));
                        return;
                    }
                    if (!driver.key)
                        driver.key = driver.name.split(" ")[1].substring(0, 3).toLowerCase();
                });
                drivers_1.saveDrivers(drivers).then(function (success) {
                    return drivers_1.getDrivers(true);
                }).then(function (drivers) {
                    console.log(drivers);
                    reply(drivers).code(201);
                }).catch(function (error) {
                    reply(Boom.badRequest(error.message));
                });
            }
        }
    }
];
