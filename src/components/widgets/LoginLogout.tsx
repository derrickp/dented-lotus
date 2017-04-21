
import * as React from "react"; 
import { GoogleLogin } from "../Auth/GoogleLogin";
import { FacebookLogin } from "../Auth/FacebookLogin";
import { Modal, Button } from "react-bootstrap";

export interface LoginLogoutProps {
    doGoogleLogin: () => Promise<void>;
    doFacebookLogin: () => Promise<void>;
    loggedIn: boolean;
    show: boolean;
    onLogin: () => void;
}

export interface LoginLogoutState {
}

export class LoginLogout extends React.Component<LoginLogoutProps, LoginLogoutState>{
    /**
     *
     */
    constructor(props: LoginLogoutProps) {
        super(props);
        this.state = { modalVisible: false, sidebarOpen: false, loading: false };
        this.hideLoginModal = this.hideLoginModal.bind(this);
        this.googleLogin = this.googleLogin.bind(this);
        this.fbLogin = this.fbLogin.bind(this);
    }

    googleLogin() {
        this.setState({ loading: true });
        this.props.doGoogleLogin().then(() => {
            this.setState({ loading: false });
            this.hideLoginModal();
        });
    }

    fbLogin() {
        this.setState({ loading: true });
        this.props.doFacebookLogin().then(() => {
            this.setState({ loading: false });
            this.hideLoginModal();
        });
    }

    hideLoginModal() {
        this.props.onLogin();
    }

    render() {
        const googleLogin = this.props.doGoogleLogin ? this.googleLogin : null;
        const fbLogin = this.props.doFacebookLogin ? this.fbLogin : null;
        return <Modal show={this.props.show} onHide={this.hideLoginModal} >
            <Modal.Header closeButton={true}>
                <Modal.Title>Log In or Sign Up With</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <GoogleLogin login={googleLogin} loggedIn={this.props.loggedIn} />
                <FacebookLogin loggedIn={this.props.loggedIn} login={fbLogin}></FacebookLogin>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.hideLoginModal}>Close</Button>
            </Modal.Footer>
        </Modal>;
    }
}
