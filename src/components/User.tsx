import * as React from "react";
import { User } from "../../common/models/User";

export interface UserProps { 
    small?:boolean;
    user: User;
}

export interface SmallNameProps  {
    name:string;
    imgUrl:string;
}

export class UserComponent extends React.Component<UserProps, any>{ 
    /**
     *
     */
    constructor(props: UserProps) {
        super(props);
    }

    componentDidMount(): void {

    }

    changed(inValue) {
        this.setState((prevState)=>({
            firstName : inValue.target.value
        })); 
    }


    render(): JSX.Element | null { 
        if (this.props.small){
            return <SmallUser imgUrl={this.props.user.imageUrl} name={this.props.user.name}/>
        }
        return <FullUser user={this.props.user}/>
    }
}

function FullUser(props:UserProps){
        return <div>
            <div> 
            </div>  
        </div>;
}
function SmallUser(props:SmallNameProps){
    return <li className="small-user">
            <img className="round" src={props.imgUrl}/>
            <span>{props.name}</span>
        </li>;
}