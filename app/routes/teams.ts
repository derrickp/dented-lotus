
import { IRouteConfiguration } from "hapi";
import * as Boom from "boom";

import { getTeams, getTeamResponses, saveTeams } from "../utilities/data/teams";
import { TeamResponse } from "../../common/responses/TeamResponse";

export const teamRoutes: IRouteConfiguration[] = [
    {
        method: 'GET',
        path: '/teams/{key?}',
        config: {
            cors: true,
            handler: async (request, reply: (drivers: TeamResponse[] | Boom.BoomError) => void) => {
                try {
                    const keys = request.params["key"] ? [request.params["key"]] : [];
                    const teams = await getTeamResponses(keys);
                    reply(teams);
                } catch (exception) {
                    reply(Boom.badRequest(exception));
                }
            }
        }
    },
    {
        method: "PUT",
        path: "/admin/teams/{key}",
        config: {
            cors: true,
            handler: async (request, reply) => {
                const team: TeamResponse = request.payload;
                try {
                    await saveTeams([team]);
                    const newTeams = await getTeamResponses([team.key]);
                    reply(newTeams);
                } catch (exception) {
                    reply(Boom.badRequest(exception));
                }
            },
            auth: {
                strategies: ['jwt'],
                scope: ['admin']
            }
        }
    },
    {
        method: "POST",
        path: "/admin/teams",
        config: {
            cors: true,
            handler: async (request, reply) => {
                const teams: TeamResponse[] = request.payload;

                for (const team of teams) {
                    if (team.key) {
                        reply(Boom.badRequest("cannot create a driver with a pre-defined key"));
                        return;
                    }
                    if (!team.name) {
                        reply(Boom.badRequest("need a team name"));
                        return;
                    }
                    team.key = team.name.toLowerCase().replace(/\s+/g, '-');
                }
                try {
                    await saveTeams(teams);
                    const keys = teams.map(t => t.key);
                    const newTeams = await getTeamResponses(keys);
                    reply(newTeams);
                } catch (exception) {
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