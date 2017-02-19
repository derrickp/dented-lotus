import * as React from "react";
import { Blog } from "../models/Blog";
import { StateManager } from "StateManager";
import { Promise } from "bluebird";
import { PropsBase } from "../utilities/ComponentUtilities";
export interface BlogProps extends PropsBase {
}

export class BlogComponent extends React.Component<BlogProps, any>{
    /** 
     *
     */
    constructor(props: BlogProps) {
        super(props);
        this.state = { blogs: [] };
        this.props.stateManager.getBlogs().then((blogs) => {
            this.setState({ blogs: blogs });
        });
    }


    render() {
        let out = [];
        this.state.blogs.forEach((blog) => {
            out.push(
                <li className="blog-entry" key={blog.title}>
                    <div className="header">
                        <div className="date">{blog.date}</div>
                        <div className="title">{blog.title}</div>
                    </div>
                    <div>
                        <div className="message">{blog.message}</div>
                        <div className="author">{blog.author}</div>
                    </div>
                </li>
            );
        });
        return <ul className="blog-posts">{out}</ul>;
    }
}