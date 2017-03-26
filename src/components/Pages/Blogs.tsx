import * as React from "react";

import { Grid, Row, Col, Button, Jumbotron } from "react-bootstrap";

import { BlogResponse } from "../../../common/models/Blog";
import { Blog } from "../widgets/Blog";
import { BlogEditor } from "../widgets/BlogEditor";

export interface BlogsProps {
    showAddButton: boolean;
    blogs: BlogResponse[];
    numBlogs: number;
    saveNewBlog: (blogData: BlogResponse) => Promise<void>;
}

export interface BlogsState {
    addingNew: boolean;
    saving: boolean;
}

export class Blogs extends React.Component<BlogsProps, BlogsState> {

    constructor(props: BlogsProps) {
        super(props);
        this.clickCreateBlog = this.clickCreateBlog.bind(this);
        this.state = {
            addingNew: false,
            saving: false
        };
        this.saveBlog = this.saveBlog.bind(this);
        this.cancelCreatingBlog = this.cancelCreatingBlog.bind(this);
    }

    cancelCreatingBlog() {
        this.setState({ addingNew: false });
    }

    clickCreateBlog() {
        this.setState({ addingNew: true });
    }

    saveBlog(b: BlogResponse) {
        this.setState({ addingNew: false, saving: true });
        this.props.saveNewBlog(b).then(() => {
            this.setState({ saving: false });
        });
    }

    render() {
        if (this.state.addingNew) {
            return <BlogEditor cancel={this.cancelCreatingBlog} readOnly={false} saveBlog={this.saveBlog}></BlogEditor>;
        }

        if (this.state.saving) {
            const style: React.CSSProperties = {
                color: "green"
            };
            return <h2 style={style}>Saving...</h2>
        }

        let numBlogs = this.props.numBlogs;
        if (!numBlogs || numBlogs <= 0 || numBlogs > this.props.blogs.length) {
            numBlogs = this.props.blogs.length;
        }

        const blogWidgets: JSX.Element[] = [];

        for (let i = 0; i < numBlogs; i++) {
            const blogWidget = <li key={i}><Blog blog={this.props.blogs[i]}></Blog></li>;
            blogWidgets.push(blogWidget);
        }

        if (numBlogs <= 0 && !this.props.showAddButton) {
            return null;
        }

        return (
            <Jumbotron>
                <Grid>
                    <h2>Blogs</h2>
                    {
                        this.props.showAddButton && !this.state.addingNew && <Row className="show-grid">
                            <Col md={9} xs={4} xsOffset={4} mdOffset={9} lg={10} lgOffset={10}>
                                <Button onClick={this.clickCreateBlog} bsStyle={"primary"} bsSize={"large"}>Create New Blog</Button>
                            </Col>
                        </Row>
                    }
                    <Row className="show-grid">
                        <Col xs={12} md={12} lg={12}>
                            <ul key={"blogs"}>
                                {blogWidgets}
                            </ul>
                        </Col>
                    </Row>
                </Grid>
            </Jumbotron>
        );
    }
}