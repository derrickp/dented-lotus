'use strict';

import { IRouteConfiguration } from "hapi";
import * as Boom from "boom";

import { saveDrivers, getDrivers, getDriverResponses } from "../utilities/data/drivers";
import { DriverResponse } from "../../common/responses/DriverResponse";
import { TeamResponse } from "../../common/models/Team";

export const driverRoutes: IRouteConfiguration[] = [
    {
        method: 'GET',
        path: '/drivers/{key?}',
        config: {
            cors: true,
            handler: async (request, reply: (drivers: DriverResponse[] | Boom.BoomError) => void) => {
                try {
                    const keys = request.params["key"] ? [request.params["key"]] : [];
                    const drivers = await getDriverResponses(false, keys);
                    reply(drivers);
                } catch (exception) {
                    reply(Boom.badRequest(exception));
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/drivers/active/{key?}',
        config: {
            cors: true,
            handler: async (request, reply) => {
                try {
                    const drivers = getDriverResponses(true, [request.params["key"]]);
                    reply(drivers);
                } catch (exception) {
                    reply(Boom.badRequest(exception));
                }
            }
        }
    },
    {
        method: "PUT",
        path: "/admin/drivers/{key}",
        config: {
            cors: true,
            handler: (request, reply) => {
                const driver: DriverResponse = request.payload;
                saveDrivers([driver]).then(success => {
                    return getDrivers(false, [driver.key]);
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
        path: "/admin/drivers",
        config: {
            cors: true,
            handler: async (request, reply) => {
                const drivers: DriverResponse[] = request.payload;
                for (const driver of drivers) {
                    if (!driver.lastName) {
                        reply(Boom.badRequest("need a driver last name"));
                        return;
                    }
                    driver.key = driver.lastName.toLowerCase();
                }
                try {
                    const success = await saveDrivers(drivers);
                    const driverKeys = drivers.map(d => d.key);
                    const newDrivers = await getDriverResponses(false, driverKeys);
                    reply(newDrivers);
                }
                catch (exception) {
                    reply(Boom.badRequest(exception));
                }
            },
            auth: {
                strategies: ['jwt'],
                scope: ['admin']
            }
        }
    }
]