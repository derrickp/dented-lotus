
import * as React from "react";
import { User, FacebookUser, GoogleUser } from "../../../common/models/User";
import { FacebookLogin } from 'react-facebook-login';
import Rodal from "rodal";
import { Modal } from "./Modal";
import {Pages} from "../Pages";
import {MenuComponent}  from "../Menu";
import { GoogleLogin } from "../Auth/GoogleLogin";

export interface LoginLogoutProps {
    onPageChange: (page: string) => void;
    completeGoogleLogin: (args) => void;
    logout: () => void;
    signUp: (type: string) => void;
    loggedIn: boolean;
    user: User;
}
export class LoginLogout extends React.Component<LoginLogoutProps, any>{
    completeGoogleLogin: (args) => void;
    /**
     *
     */
    constructor(props: LoginLogoutProps) {
        super(props);
        this.state = { modalVisible: false, sidebarOpen: false };
        this.completeGoogleLogin = props.completeGoogleLogin;
    }

    showLoginModal() {
        this.setState({ modalVisible: true });
    }

    hideLoginModal() { 
        this.setState({ modalVisible: false });
    }

    facebookSignedIn(args) {
        alert("facebookLoggedIn");
        this.hideLoginModal();
    }

    onMenuClicked(){
        let next= !this.state.sidebarOpen;
        this.setState({sidebarOpen: next});
    }

    onLogin() {
        this.hideLoginModal();
    }

    onSignUp(type: string) {
        this.hideLoginModal();
        this.props.signUp(type);
    }

    render() {
        let sidebarContent = "<b>Sidebar content</b>";
        if (this.props.loggedIn) {
            return <div className="logout" onClick={this.onMenuClicked.bind(this)}>
                <MenuComponent user={this.props.user} onPageChange={this.props.onPageChange} isOpen={this.state.sidebarOpen} onLogout={this.props.logout}/>
            </div>
        } else {
            let content = <div className="login-modal">
                <div className="modal-header">Log In With</div>
                <GoogleLogin loggedIn={this.props.loggedIn} completeGoogleLogin={this.completeGoogleLogin} onLogin={this.onLogin.bind(this)} />
                <div>Sign Up With</div>
                <button id="signupBtn" onClick={() => { this.onSignUp("google"); }}>
                    <span className="signup-icon"></span>
                    <span className="signup-buttonText">Dented Lotus</span>
                </button>
            </div>
            return <div className="login"><span onClick={this.showLoginModal.bind(this)}>Log In / Sign Up</span>
                <Modal content={content} isOpen={this.state.modalVisible} onClose={this.hideLoginModal.bind(this)} />
            </div>
        }
    }
}
