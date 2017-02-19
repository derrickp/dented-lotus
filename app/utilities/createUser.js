'use strict';
var joi_1 = require("joi");
exports.createUserSchema = joi_1.object({
    displayName: joi_1.string().alphanum().min(2).max(30),
    email: joi_1.string().email().required(),
    password: joi_1.string().required(),
    firstName: joi_1.string().alphanum(),
    lastName: joi_1.string().alphanum()
});
