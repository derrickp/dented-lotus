'use strict';

import { IRouteConfiguration } from "hapi";
import { getDrivers } from "../utilities/sqliteUtilities";

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
    }
]