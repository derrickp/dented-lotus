'use strict';

import * as Joi from "joi";

export const authenticateUserSchema = Joi.alternatives().try([
  Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })]
);