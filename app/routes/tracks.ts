'use strict';

import { IRouteConfiguration } from "hapi";
import { getTracks } from "../utilities/sqliteUtilities";

export const trackRoutes: IRouteConfiguration[] = [
    {
        method: 'GET',
        path: '/tracks/{key?}',
        config: {
            cors: true,
            handler: (request, reply) => {
                getTracks(parseInt(request.params["key"])).then(tracks => {
                    reply(tracks);
                });
            }
        }
    }
]