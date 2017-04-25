import { User } from "../../../common/models/User";
import { RaceModel } from "../../../common/models/Race";
import {DentedLotusComponentBase, DentedLotusProps, React,ReactDOM} from "../../DefaultImports"; 

export interface PredictionsAdminProps extends DentedLotusProps {
    user: User;
    races: RaceModel[];
}

export interface PredictionsAdminState {

}

export class PredictionsAdmin extends DentedLotusComponentBase<PredictionsAdminProps, PredictionsAdminState> {

    render() {
        if (!this.props.user.isAdmin) {
            return <div>Access Denied!</div>;
        }

        
    }
}