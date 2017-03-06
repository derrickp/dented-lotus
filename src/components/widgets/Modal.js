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
var rodal_1 = require("rodal");
var React = require("react");
var Modal = (function (_super) {
    __extends(Modal, _super);
    /**
     *
     */
    function Modal(props) {
        var _this = _super.call(this, props) || this;
        _this.onClose = props.onClose;
        return _this;
    }
    Modal.prototype.render = function () {
        return React.createElement(rodal_1.default, { visible: this.props.isOpen, animation: "zoom", onClose: this.onClose.bind(this) }, this.props.content);
    };
    return Modal;
}(React.Component));
exports.Modal = Modal;
