import * as React from "react";
import { BlogResponse } from "../../common/models/Blog";

export interface BlogsProps {
    blogs: BlogResponse[];
    numberBlogs?: number;
}

export interface BlogsState {
}

export namespace BlogSortType {
    export const DATE = "date";
    export const AUTHOR = "author";
}

export class BlogsComponent extends React.Component<BlogsProps, BlogsState>{
    private _unmounted: boolean = true;
    /** 
     *
     */
    constructor(props: BlogsProps) {
        super(props);
        this.state = { blogs: null };
    }

    render() {
        if (!this.props.blogs) {
            return <div></div>;
        }
        let out: JSX.Element[] = [];
        for (let i = 0; i < this.props.blogs.length; i++) {
            const blog = this.props.blogs[i];
            out.push(
                <li key={i} className="blog-entry">
                    <div className="header">
                        <div className="date">{blog.postDate}</div>
                        <div className="title">{blog.title}</div>
                    </div>
                    <div>
                        <div className="message">{blog.message}</div>
                        <div className="author">{blog.author.firstName}</div>
                    </div>
                </li>
            );
        }
        return <ul key={"blogs"} className="blog-posts">{out}</ul>;
    }
}