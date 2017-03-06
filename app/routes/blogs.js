'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var db = require('../utilities/sqliteUtilities');
exports.blogRoutes = [
    {
        method: 'GET',
        path: '/blogs',
        config: {
            cors: true,
            handler: function (request, reply) {
                db.getBasicUsers().then(function (basicUsers) {
                    db.getBlogs().then(function (blogs) {
                        if (blogs && blogs.length > 0 && basicUsers && basicUsers.length > 0) {
                            blogs.forEach(function (blog) {
                                var user = basicUsers.filter(function (basicUser) { return basicUser.key === blog.userKey; })[0];
                                console.log(user);
                                if (user) {
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
];
