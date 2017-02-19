'use strict';

import { IRouteConfiguration } from "hapi";
import { getRaces } from "../utilities/sqliteUtilities";

export const raceRoutes: IRouteConfiguration[] = [
    {
        method: 'GET',
        path: '/races/{season}/{key?}',
        config: {
            cors: true,
            handler: function (request, reply) {
                getRaces(request.params["season"], request.params["key"]).then(races => {
                    reply(races);
                });
            }
        }
    }
]