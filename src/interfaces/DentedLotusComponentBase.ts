import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppManager } from "../AppManager";
import { DentedLotusProps} from "../components/DentedLotus";

export class DentedLotusComponentBase<DentedLotusProps, TState> extends React.Component<DentedLotusProps, TState>{
    app: AppManager;

    /**
     *
     */
    constructor(props:DentedLotusProps) {
        super(props);
        if ((<any>props).app){
            this.app = (<any>props).app;
        }
    }
}