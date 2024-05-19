import Joi, { ObjectSchema } from 'joi';

const loginSchema: ObjectSchema = Joi.object().keys({
  username: Joi.alternatives().conditional(Joi.string().email(), {
    then: Joi.string().email().required().messages({
      'string.base': 'Email must be of type string',
      'string.email': 'Invalid email',
      'string.empty': 'Email is a required field'
    }),
    otherwise: Joi.string().min(4).max(12).required().messages({
      'string.base': 'Username must be of type string',
      'string.min': 'Username length must be from 4 to 12 characters',
      'string.max': 'Username length must be from 4 to 12 characters',
      'string.empty': 'Username is a required field'
    })
  }),
  password: Joi.string().min(6).max(32).required().messages({
    'string.base': 'Password must be of type string',
    'string.min': 'Password length must be from 6 to 32 characters',
    'string.max': 'Password length must be from 6 to 32 characters',
    'string.empty': 'Password is a required field'
  }),
  browserName: Joi.string().optional().empty(''),
  deviceType: Joi.string().optional().empty('')
});

export { loginSchema };
