import * as React from "react";
import { BlogResponse } from "../../common/models/Blog";

export interface BlogsProps {
    blogs: Promise<BlogResponse[]>;
}

export interface BlogsState {
    blogs: BlogResponse[];
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

    componentDidMount() {
        this._unmounted = false;
        this.props.blogs.then((blogs) => {
            if (!this._unmounted) this.setState({ blogs: blogs });
        });
    }

    componentWillUnmount() {
        this._unmounted = true;
    }

    render() {
        if (!this.state.blogs) {
            return <div></div>;
        }
        let out: JSX.Element[] = [];
        for (let i = 0; i < this.state.blogs.length; i++) {
            const blog = this.state.blogs[i];
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