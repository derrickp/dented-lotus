import * as React from "react";
import * as ReactDOM from "react-dom";

export interface SelectOption {
    display: string;
    value: any;
}

export interface SelectProps {
    isStrings: boolean;
    label:string;
    strings: string[];
    options: SelectOption[];
    selectMessage?: string;
    onStringChanged?: (selected: string) => any;
    onOptionChanged?: (selected: SelectOption) => any;
}

export interface SelectState {
    options: any;
    selectedOption: SelectOption | string;
}

export class SelectBox extends React.Component<SelectProps, SelectState>{

    className = "react-select-box";
    /**
     *
     */
    constructor(props: SelectProps) {
        super(props);
        let options = props.isStrings ? props.strings : props.options;

        this.state = {
            options: options,
            selectedOption: props.selectMessage ? props.selectMessage : options[0]
        };

    }

    private createOptionFromString(option: string): JSX.Element {
        return <option value={option} selected={this.state.selectedOption == option}>{option}</option>
    }

    private createOptionFromSelectOption(option: SelectOption): JSX.Element {
        return <option value={option.value} >{option.display}</option>

    }

    private createOption(option: SelectOption | string): JSX.Element {
        if (typeof (option) === 'string') {
            return this.createOptionFromString(option);
        } else {
            return this.createOptionFromSelectOption(option);
        }
    } 

    onChanged(x){
        let val = x.target.selectedOptions[0];
        if (this.props.isStrings){
            return this.props.onStringChanged(val.text);
        }else{
            return this.props.onOptionChanged({
                display:val.text,
                value:val.value           
            });
        } 
}


    render(){ 
        let opts = this.state.options.map((option)=>{return this.createOption(option);});
        return <span><label className="select-box-label">{this.props.label}</label>:<select className={this.className} onChange={this.onChanged.bind(this)}>{opts}</select></span>
    }
}