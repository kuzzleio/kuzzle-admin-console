import trim from 'lodash/trim';

import { ENV_COLORS } from './utils';

export const startsWithSpace = (value) => {
  return value[0] === ' ';
};

export const isWhitespace = (value) => {
  return trim(value) === '';
};
export const isValidHostname = (value) => {
  return /^@$|^(\*)$|^(\*\.)?(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9](\.?))$/.test(
    value,
  );
};
export const notIncludeScheme = (value) => {
  return !/^(http|ws):\/\//.test(value);
};
export const isUppercase = (value) => {
  return /[A-Z]/.test(value);
};
export const isValidEnvironment = (env) => {
  return (
    env !== null &&
    typeof env.name === 'string' &&
    typeof env.host === 'string' &&
    typeof env.backendMajorVersion === 'number' &&
    typeof env.port === 'number' &&
    env.ssl !== undefined &&
    env.ssl !== null &&
    typeof env.color === 'string' &&
    ENV_COLORS.includes(env.color)
  );
};
