import * as sqlite3 from "sqlite3";

import { BlogResponse } from "../../../common/responses/BlogResponse";
import { getUsersByEmail } from "./users";
const db = new sqlite3.Database('app/Data/' + process.env.DBNAME);
const blogSelect = "select * from blogs_vw";

export async function getBlogResponses(): Promise<BlogResponse[]> {
    const basicUsers = await getUsersByEmail();
    if (!basicUsers || !basicUsers.length) {
        return [];
    }
    const blogs = await new Promise<BlogResponse[]>((resolve, reject) => {
        try {
            db.all(blogSelect, (err, blogRows: DbBlog[]) => {
                if (err) {
                    reject(err);
                    return;
                }
                const blogs: BlogResponse[] = [];
                for (const blogRow of blogRows) {
                    const user = basicUsers.filter(basicUser => { return basicUser.key === blogRow.author })[0];
                    if (!user) {
                        continue;
                    }
                    const blog: BlogResponse = {
                        message: blogRow.message,
                        imageUrl: blogRow.imageUrl,
                        postDate: blogRow.postDate,
                        title: blogRow.title,
                        author: user
                    };
                    blogs.push(blog);
                }
                resolve(blogs);
            });
        } catch (exception) {
            reject(exception);
        }
    });
    return blogs;
}

export function saveNewBlog(blog: BlogResponse): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const insert = `
        INSERT INTO blogs
        (message, title, userkey, postdate)
        VALUES (?1, ?2, ?3, ?4)`;
        try {
            let valuesObject = {
                1: blog.message,
                2: blog.title,
                3: blog.author.key,
                4: blog.postDate
            };
            db.run(insert, valuesObject);
            resolve(true);
        } catch (exception) {
            reject(exception);
        }
    });
}

export interface DbBlog {
    postDate: string;
    message: string;
    author: string;
    title: string;
    imageUrl?: string;
}