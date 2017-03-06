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
var LoginLogout_1 = require("./widgets/LoginLogout");
;
var Banner = (function (_super) {
    __extends(Banner, _super);
    /**
     *
     */
    function Banner(props) {
        var _this = _super.call(this, props) || this;
        _this.stateManager = props.stateManager;
        _this.onMenuClicked = props.onMenuClicked;
        _this.onPageChange = props.onPageChange;
        _this.onGoogleLogin = props.onGoogleLogin;
        return _this;
    }
    Banner.prototype.render = function () {
        return React.createElement("div", { className: "banner" },
            React.createElement("h1", null, this.props.title),
            React.createElement(LoginLogout_1.LoginLogout, { loggedIn: this.props.loggedIn, onGoogleLogin: this.onGoogleLogin, onPageChange: this.onPageChange, onLogin: this.props.stateManager.setUser.bind(this.stateManager), onLogout: this.props.stateManager.signOut, stateManager: this.stateManager, onMenuClicked: this.onMenuClicked }));
    };
    return Banner;
}(React.Component));
exports.Banner = Banner;
