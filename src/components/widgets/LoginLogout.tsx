
import * as React from "react";
import { StateManager } from "../../StateManager";
import { PropsBase } from "../../utilities/ComponentUtilities";
import { Promise } from "bluebird";
import { User, FacebookUser, GoogleUser } from "../../../common/models/User";
import { FacebookLogin } from 'react-facebook-login';
import Rodal from "rodal";
import { Modal } from "./Modal";
import {Pages} from "../Pages";
import {MenuComponent}  from "../Menu";
import { GoogleLogin } from "../Auth/GoogleLogin";

export interface LoginLogoutProps extends PropsBase {
    onLogin: (User) => void; 
    onPageChange: (page: string) => void;
    onGoogleLogin: (args) => void;
    loggedIn: boolean;
}
export class LoginLogout extends React.Component<LoginLogoutProps, any>{
    onLogin: (User) => void; 
    onPageChange: (page: string) => void;
    onGoogleLogin: (args) => void;
    stateManager: StateManager;
    /**
     *
     */
    constructor(props: LoginLogoutProps) {
        super(props);
        this.stateManager = props.stateManager;  
        this.state = { modalVisible: false, sidebarOpen: false };
        this.onLogin = props.onLogin; 
        this.onPageChange = props.onPageChange;
        this.onGoogleLogin = props.onGoogleLogin;
        this.stateManager.onLogIn = this.afterLogIn.bind(this);
    } 

    afterLogIn(){
        this.hideLoginModal();
        this.setState({loggedIn:true});
    }

    componentDidMount() {
        this.setState({ loggedIn: false }); 
    }

    logout() {
        this.stateManager.signOut(); 
        this.setState({ loggedIn: false });
        this.onPageChange(Pages.HOME);
    }
    showLoginModal() {
        this.setState({ modalVisible: true });
    }

    hideLoginModal() { 
        this.setState({ modalVisible: false });
    }

    googleSignedIn() {
        this.hideLoginModal();
        this.setState({loggedIn:true});
        // this.onGoogleLogin(args);
    }

    facebookSignedIn(args) {
        alert("facebookLoggedIn");
        this.hideLoginModal();
    }
    loginFailed(args) {

    }

    onMenuClicked(){
        let next= !this.state.sidebarOpen;
        this.setState({sidebarOpen: next});
    }

    render() {
        let sidebarContent = "<b>Sidebar content</b>";
        if (this.props.loggedIn) {
            return <div className="logout" onClick={this.onMenuClicked.bind(this)}>
                <MenuComponent onPageChange={this.onPageChange.bind(this)} stateManager={this.stateManager} isOpen={this.state.sidebarOpen} onLogout={this.logout.bind(this)}/>
            </div>
        } else {
            let content = <div className="login-modal">
                <div className="modal-header">Log In</div>
                <GoogleLogin loggedIn={this.props.loggedIn} onGoogleLogin={this.onGoogleLogin} stateManager={this.stateManager} />
                {/*<div className="g-signin2" data-onsuccess="onGoogleSignIn"></div>*/}
                {/*<FacebookLogin appId="1088597931155576" autoLoad={true} fields="name,email,picture" callback={(a) => { }} cssClass="my-facebook-button-class" icon="fa-facebook" />*/}
                {/*<div className="fb-login-button" data-max-rows="1" data-size="large" data-show-faces="false" data-auto-logout-link="false" data-onsuccess={this.facebookSignedIn.bind(this)}></div>*/}
            </div>
            return <div className="login"><span onClick={this.showLoginModal.bind(this)}>Log In</span>
                <Modal content={content} isOpen={this.state.modalVisible} stateManager={this.stateManager} onClose={this.hideLoginModal.bind(this)} />
            </div>
        }
    }
}
