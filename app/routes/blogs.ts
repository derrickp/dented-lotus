'use strict';
import { IRouteConfiguration } from "hapi";
const db = require('../utilities/sqliteUtilities');

export const blogRoutes: IRouteConfiguration[] = [
    {
        method: 'GET',
        path: '/blogs',
        config: {
            cors: true,
            handler: (request, reply) => {
                db.getBasicUsers().then(basicUsers => {
                    db.getBlogs().then(blogs => {
                        if (blogs && blogs.length > 0 && basicUsers && basicUsers.length > 0)
                        {
                            blogs.forEach(blog => {
                                
                                var user = basicUsers.filter(basicUser => { return basicUser.key === blog.userKey })[0];
                                console.log(user);
                                if (user)
                                {
                                    blog.userDisplayName = user.displayName;
                                    blog.userKey = undefined;
                                }
                            });
                        }
                        reply(blogs);
                    });    
                });
            }
        }
    }
]