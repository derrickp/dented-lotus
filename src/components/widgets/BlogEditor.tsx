import * as React from "react";

import { Grid, Row, Col, Button, Form, FormGroup, ControlLabel, FormControl, Panel } from "react-bootstrap";

import { EditorState, ContentState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';

import { BlogResponse } from "../../../common/models/Blog";

export interface BlogEditorProps {
    saveBlog: (b: BlogResponse) => void;
    cancel: () => void;
    readOnly: boolean;
}

export interface BlogEditorState {
    title: string;
    editorState: EditorState;
}

export class BlogEditor extends React.Component<BlogEditorProps, BlogEditorState> {
    onChange: (editorState: any) => void;
    handleTitleChange: (event: any) => void;

    constructor(props: BlogEditorProps) {
        super(props);
        this.state = {
            title: "",
            editorState: EditorState.createEmpty()
        }

        this.handleTitleChange = (event) => this.setState({ title: event.currentTarget.value });
        this.save = this.save.bind(this);
        this.onEditorStateChange = this.onEditorStateChange.bind(this);
    }

    onEditorStateChange(state: EditorState) {
        this.setState({ editorState: state });
    }

    save() {
        const rawContentState = convertToRaw(this.state.editorState.getCurrentContent());
        const markup = draftToHtml(rawContentState, null, false, null);
        const blog: BlogResponse = {
            author: null,
            imageUrl: "",
            message: markup,
            title: this.state.title,
            postDate: null
        }
        this.props.saveBlog(blog);
    }

    render() {
        const style: React.CSSProperties = {
            paddingBottom: "1em"
        };
        return (
            <Grid>
                <Row style={style}>
                    <Col xs={10} md={9} sm={8} >
                        <Form inline>
                            <FormGroup bsSize={"large"} controlId="formInlineName">
                                <ControlLabel>Title: </ControlLabel>
                                {' '}
                                <FormControl type="text" value={this.state.title} onChange={this.handleTitleChange} placeholder="Blog title" />
                            </FormGroup>
                        </Form>
                    </Col>
                    <Col xs={4} md={1} sm={2}>
                        <Button bsSize={"large"} bsStyle={"primary"} onClick={this.save}>Save</Button>
                    </Col>
                    <Col md={1} sm={1} xs={4}>
                        <Button bsSize={"large"} onClick={this.props.cancel}>Cancel</Button>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} md={12}>
                        <Panel>
                            <Editor toolbarOnFocus={true}
                                editorState={this.state.editorState}
                                toolbarClassName="home-toolbar"
                                wrapperClassName="home-wrapper"
                                editorClassName="home-editor"
                                onEditorStateChange={this.onEditorStateChange}
                            />
                        </Panel>
                    </Col>
                </Row>
            </Grid>
        );
    }
}