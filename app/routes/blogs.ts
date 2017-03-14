'use strict';
import { IRouteConfiguration } from "hapi";
import * as Boom from "boom";

import { BlogResponse } from "../../common/models/Blog";
import { Credentials } from "../../common/models/Authentication";
import { getBlogResponses, saveNewBlog } from "../utilities/data/blogs";

export const blogRoutes: IRouteConfiguration[] = [
    {
        method: 'GET',
        path: '/blogs',
        config: {
            cors: true,
            handler: async (request, reply: (blogResponses: BlogResponse[] | Boom.BoomError) => void) => {
                try {
                    const blogs = await getBlogResponses();
                    reply(blogs);
                } catch (exception) {
                    reply(Boom.badRequest(exception));
                }
            }
        }
    },
    {
        method: "POST",
        path: "/blogs",
        config: {
            cors: true,
            handler: async (request, reply) => {
                const credentials: Credentials = request.auth.credentials;
                const blog: BlogResponse = request.payload;
                try {
                    const success = await saveNewBlog(blog);
                    reply("done").code(201);
                } catch (exception) {
                    reply(Boom.badRequest(exception));
                }
            },
            auth: {
                strategies: ['jwt'],
                scope: ['user']
            }
        }
    }
]