import { Grid, Row, Col, Button, Jumbotron } from "react-bootstrap"; 
import { BlogResponse } from "../../../common/responses/BlogResponse";
import { Blog } from "../widgets/Blog";
import { BlogEditor } from "../widgets/BlogEditor"; 
import {DentedLotusComponentBase, DentedLotusProps, React} from "../../DefaultImports"; 

export interface BlogsProps extends DentedLotusProps {
    showAddButton: boolean;
    blogs: BlogResponse[];
    numBlogs: number;
    title?:string;
    fromHomePanel:boolean;
    saveNewBlog: (blogData: BlogResponse) => Promise<void>;
}

export interface BlogsState {
    addingNew: boolean;
    saving: boolean;
}

export class Blogs extends DentedLotusComponentBase<BlogsProps, BlogsState> {

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
        if (this.props.fromHomePanel){
            return this.getBlogRows(blogWidgets);
        }else{
            return <Grid>
                    {this.getTitle()}
                    {this.getAddButton()}
                    {this.getBlogRows(blogWidgets)}
                </Grid>
        }
        /*return (
            <Grid>
                {this.props.title && <Row><Col><h2>{this.props.title}</h2></Col></Row>}
                {
                    this.props.showAddButton && !this.state.addingNew && <Row className="show-grid">
                        <Col md={9} xs={4} xsOffset={4} mdOffset={9} lg={9} lgOffset={10}>
                            <Button onClick={this.clickCreateBlog} bsStyle={"primary"} bsSize={"large"}>Create New Blog</Button>
                        </Col>
                    </Row>
                }
                <Row className="show-grid">
                    <Col xs={12} md={9} lg={9}>
                        <ul className="no-pad" key={"blogs"}>
                            {blogWidgets}
                        </ul>
                    </Col>
                </Row>
            </Grid>
        );*/
    }
    getAddButton(){
        if (this.props.showAddButton && !this.state.addingNew ){
            return  <Row className="show-grid">
                        <Col md={12} xs={12} xsOffset={4} mdOffset={9} lg={12} lgOffset={10}>
                            <Button onClick={this.clickCreateBlog} bsStyle={"primary"} bsSize={"large"}>Create New Blog</Button>
                        </Col>
                    </Row>
        }else{
            return null;
        } 
        
    }
    getTitle(){
        if (this.props.title){
            return <Row><Col><h2>{this.props.title}</h2></Col></Row>;
        }
        else{
            return null;
        }
    }
    getBlogRows(blogWidgets){
        return <Row className="show-grid">
                    <Col xs={12} md={12} lg={12}>
                        <ul className="no-pad" key={"blogs"}>
                            {blogWidgets}
                        </ul>
                    </Col>
                </Row>
    }
}