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
var UserComponent = (function (_super) {
    __extends(UserComponent, _super);
    /**
     *
     */
    function UserComponent(props) {
        return _super.call(this, props) || this;
    }
    UserComponent.prototype.componentDidMount = function () {
    };
    UserComponent.prototype.changed = function (inValue) {
        this.setState(function (prevState) { return ({
            firstName: inValue.target.value
        }); });
    };
    UserComponent.prototype.render = function () {
        if (this.props.small) {
            return React.createElement(SmallUser, { imgUrl: this.props.stateManager.currentUser.imageUrl, name: this.props.stateManager.currentUser.getName() });
        }
        return React.createElement(FullUser, { stateManager: this.props.stateManager });
    };
    return UserComponent;
}(React.Component));
exports.UserComponent = UserComponent;
function FullUser(props) {
    return React.createElement("div", null,
        React.createElement("div", null));
}
function SmallUser(props) {
    return React.createElement("div", { className: "small-user" },
        React.createElement("img", { className: "round", src: props.imgUrl }),
        React.createElement("span", null, props.name));
}
