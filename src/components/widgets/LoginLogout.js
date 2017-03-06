"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var Modal_1 = require("./Modal");
var Menu_1 = require("../Menu");
var LoginLogout = (function (_super) {
    __extends(LoginLogout, _super);
    /**
     *
     */
    function LoginLogout(props) {
        var _this = _super.call(this, props) || this;
        _this.stateManager = props.stateManager;
        _this.login = _this.login.bind(_this);
        _this.logout = _this.logout.bind(_this);
        _this.state = { loggedIn: false, modalVisible: false, sidebarOpen: false };
        _this.onLogin = props.onLogin;
        _this.onLogout = props.onLogout;
        _this.onPageChange = props.onPageChange;
        _this.onGoogleLogin = props.onGoogleLogin;
        return _this;
    }
    LoginLogout.prototype.componentDidMount = function () {
        this.setState({ loggedIn: false });
    };
    LoginLogout.prototype.logout = function () {
        this.onLogout();
        this.setState({ loggedIn: false });
    };
    LoginLogout.prototype.login = function () {
        this.setState({ modalVisible: true });
    };
    LoginLogout.prototype.hide = function () {
        this.setState({ modalVisible: false });
    };
    LoginLogout.prototype.googleSignedIn = function () {
        this.hide();
        // this.onGoogleLogin(args);
    };
    LoginLogout.prototype.facebookSignedIn = function (args) {
        alert("facebookLoggedIn");
        this.hide();
    };
    LoginLogout.prototype.loginFailed = function (args) {
    };
    LoginLogout.prototype.onMenuClicked = function () {
        var next = !this.state.sidebarOpen;
        this.setState({ sidebarOpen: next });
    };
    LoginLogout.prototype.render = function () {
        var sidebarContent = "<b>Sidebar content</b>";
        if (this.props.loggedIn) {
            return React.createElement("div", { className: "logout", onClick: this.onMenuClicked.bind(this) },
                React.createElement(Menu_1.MenuComponent, { onPageChange: this.onPageChange.bind(this), stateManager: this.stateManager, isOpen: this.state.sidebarOpen }));
        }
        else {
            var content = React.createElement("div", { className: "login-modal" },
                React.createElement("div", { className: "modal-header" }, "Log In"),
                React.createElement("div", { className: "g-signin2", "data-onsuccess": "onGoogleSignIn" }));
            return React.createElement("div", { className: "login" },
                React.createElement("span", { onClick: this.login }, "Log In"),
                React.createElement(Modal_1.Modal, { content: content, isOpen: this.state.modalVisible, stateManager: this.stateManager, onClose: this.hide.bind(this) }));
        }
    };
    return LoginLogout;
}(React.Component));
exports.LoginLogout = LoginLogout;
