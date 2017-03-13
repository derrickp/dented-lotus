import * as React from "react";
import * as ReactDOM from "react-dom";
import { SelectBox, SelectProps, SelectOption } from "./SelectBox";

let testListStrings: string[] = ["apple", "pear", "banana"];
let testListObjects: SelectOption[] = [
    {
        display: "test1",
        value: 1
    },
    {
        display:"test2",
        value: 2
    },
    {
        display:"test3",
        value: 3
    }
]
let displayName = "Select a fruit.";

function onStringChanged(val:string){
    alert("You selected the string " +val);
}

function onOptionChanged(opt:SelectOption){
    alert("You selected " + opt.display + " and it has a value of "  + opt.value);
}
 

ReactDOM.render(
    <SelectBox label="String Test" isStrings={true} strings={testListStrings} options={[]} onStringChanged={onStringChanged} />,
    document.getElementById("string-test")
);

ReactDOM.render(
    <SelectBox label="Object Test" isStrings={false} strings={[]} options={testListObjects} onOptionChanged={onOptionChanged} />,
    document.getElementById("option-test")
);