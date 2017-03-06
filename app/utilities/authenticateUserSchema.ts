'use strict';

import * as Joi from "joi";

export const authenticateUserSchema = Joi.alternatives().try([
  Joi.object({
    authType: Joi.string().required(),
    auth_token: Joi.string().required()
  })]
);