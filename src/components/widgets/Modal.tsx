import Rodal from 'rodal';
import * as React from "react";

export interface ModalProps {
    isOpen: boolean;
    content: JSX.Element;
    onClose: () => any;
}


export class Modal extends React.Component<ModalProps, any>{
    onClose: () => any;
    /**
     *
     */
    constructor(props: ModalProps) {
        super(props);
        this.onClose = props.onClose;
    }

    render(): Rodal {
        return <Rodal visible={this.props.isOpen} animation="zoom" onClose={this.onClose.bind(this)}>
            {this.props.content}
        </Rodal>
    }
}