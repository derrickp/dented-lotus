import * as React from "react";

import { Well, Panel } from "react-bootstrap";

import { BlogResponse } from "../../../common/responses/BlogResponse";
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
    let header = <span><span>{props.blog.title}</span><span className="right" >{moment(props.blog.postDate, FULL_FORMAT).format("dddd, MMMM Do YYYY, h:mm a")}</span></span>
    return (
        <Panel header={header}> 
            <div style={bottomStyle}>
                By: {props.blog.author.display}
            </div>
            <Editor editorState={editorState} toolbarHidden={true} readOnly={true}></Editor>
        </Panel>
    );
}