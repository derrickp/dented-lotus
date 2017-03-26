import * as React from "react"; 
import { Button, Glyphicon, Panel } from "react-bootstrap"; 
import {RaceModel} from "../../common/models/Race";

export interface RaceInfoProps{
    race:RaceModel; 
    eventKey:any;
}

export interface RaceInfoState{
    info:string;
}

export class RaceInfo extends React.Component<RaceInfoProps,any>{ 
    /**
     *
     */ 
    constructor(props:RaceInfoProps) {
        super(props);
        

    } 

    render(){ 
        const infoTitle = <div><h4 className="pull-left">{"Race Info"}</h4><div className="clearfix"></div></div> 
        const race = this.props.race;
        return <Panel eventKey={this.props.eventKey} bsStyle={"primary"} header={infoTitle} collapsible={true} defaultExpanded={false}>
                { race.track.trackResponse && <p>Track: {race.track.trackResponse.name}, {race.track.trackResponse.country}</p> }
                { race.winner && <p>Winner: {race.winner.name}</p> }
                {race.track.trackResponse && <p>{race.track.trackResponse.info}</p>}
            </Panel>;
    }
}