import * as React from "react";

import { User } from "../../../common/models/User";
import { RaceModel } from "../../../common/models/Race";

export interface PredictionsAdminProps {
    user: User;
    races: RaceModel[];
}

export interface PredictionsAdminState {

}

export class PredictionsAdmin extends React.Component<PredictionsAdminProps, PredictionsAdminState> {

    render() {
        if (!this.props.user.isAdmin) {
            return <div>Access Denied!</div>;
        }

        
    }
}