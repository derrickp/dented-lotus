import * as React from "react";

import { Well } from "react-bootstrap";

import { BlogResponse } from "../../../common/models/Blog";
import { FULL_FORMAT } from "../../../common/utils/date";

import * as moment from "moment";

import { EditorState, ContentState, ContentBlock } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import { Editor } from 'react-draft-wysiwyg';

export interface BlogProps {
    blog: BlogResponse;
}

export function Blog(props: BlogProps) {
    const blocksFromHtml = htmlToDraft(props.blog.message);
    const contentBlocks: ContentBlock[] = blocksFromHtml.contentBlocks;
    const contentState = ContentState.createFromBlockArray(contentBlocks);
    const editorState = EditorState.createWithContent(contentState);
    const bottomStyle: React.CSSProperties = {
        paddingBottom: "1em"
    };
    return (
        <div>
            <h3>{props.blog.title}</h3>
            <div>
                By: {props.blog.author.displayName}
            </div>
            <div style={bottomStyle}>
                Date: {moment(props.blog.postDate, FULL_FORMAT).format("dddd, MMMM Do YYYY, h:mm a")}
            </div>
            <Editor editorState={editorState} toolbarHidden={true} readOnly={true}></Editor>
        </div>
    );
}