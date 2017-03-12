import * as React from "react";
import * as ReactDOM from "react-dom";

export interface SelectOption{
    display:string;
    value:any;
}

export interface SelectProps {
    isStrings:boolean;
    strings:string[];
    options:SelectOption[];
    onStringChanged?:(selected:string)=>any;
    onOptionChanged?:(selected:SelectOption)=>any;
}

export interface SelectState {
    options:SelectOption[] | string[];
    selectedOption: SelectOption | string;
}

export class SelectBox extends React.Component<SelectProps,SelectState>{


    /**
     *
     */
    constructor(props:SelectProps) {
        super(props);
        let options = props.isStrings ? props.strings : props.options;

        this.state = {
            options: options
        }
    }
}