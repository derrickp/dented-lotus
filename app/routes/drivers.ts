'use strict';

import { IRouteConfiguration } from "hapi";
import * as Boom from "boom";

import { saveDrivers, getDrivers } from "../utilities/data/drivers";
import { DriverResponse } from "../../common/models/Driver";

export const driverRoutes: IRouteConfiguration[] = [
    {
        method: 'GET',
        path: '/drivers/{key?}',
        config: {
            cors: true,
            handler: function (request, reply) {
                getDrivers(false, request.params["key"]).then(drivers => {
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
                getDrivers(true, request.params["key"]).then(drivers => {
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
            handler: (request, reply) => {
                const driver: DriverResponse = request.payload;
                saveDrivers([driver]).then(success => {
                    return getDrivers(false, driver.key);
                }).then(driver => {
                    reply(driver);
                }).catch((error: Error) => {
                    reply(Boom.badRequest(error.message)).code(400);
                });
            },
            auth: {
                strategies: ['jwt'],
                scope: ['admin']
            }
        }
    },
    {
        method: "POST",
        path: "/drivers",
        config: {
            cors: true,
            handler: function (request, reply) {
                const drivers: DriverResponse[] = request.payload;
                drivers.forEach(driver => {
                    if (!driver.lastName) {
                        reply(Boom.badRequest("need a driver last name"));
                        return;
                    }
                    if (!driver.key) driver.key = driver.lastName.toLowerCase();
                });
                saveDrivers(drivers).then(success => {
                    return getDrivers(true);
                }).then(drivers => {
                    console.log(drivers);
                    reply(drivers).code(201);
                }).catch((error: Error) => {
                    reply(Boom.badRequest(error.message));
                });
            },
            auth: {
                strategies: ['jwt'],
                scope: ['admin']
            }
        }
    }
]