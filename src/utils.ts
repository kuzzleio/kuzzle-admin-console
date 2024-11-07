export const antiGlitchOverlayTimeout = 900;

export const LS_ENVIRONMENTS = 'environments';
export const LS_LAST_ENV = 'lastEnv';
export const SS_CURRENT_ENV = 'currentEnv';

export const NO_ADMIN_WARNING_HOSTS = ['localhost', '127.0.0.1'];

export const DEFAULT_COLOR = 'darkblue';
export const ENV_COLORS = [
  DEFAULT_COLOR,
  'lightblue',
  'purple',
  'green',
  'orange',
  'red',
  'grey',
  'magenta',
];

export const formatForDom = (word: string): string => {
  return word.replace(/[!"#$%&'()*+,./:;<=>?@[\]^`{|}~ ]/g, '-');
};

export const sortObject = (object: object): object => {
  return Object.keys(object)
    .sort()
    .reduce((result, key) => {
      result[key] = object[key];
      return result;
    }, {});
};

export const truncateName = (name: string, maxLength = 50): string => {
  if (name.length === 0) {
    return '';
  } else if (name.length <= maxLength) {
    return name;
  }

  return `${name.substring(0, maxLength)}...`;
};

export const dateFromTimestamp = (value: string | number): Date | null => {
  let timestamp: number;

  if (typeof value === 'string') {
    if (!isNaN(Date.parse(value))) {
      timestamp = Date.parse(value);
    } else {
      timestamp = parseInt(value, 10);
    }

    if (isNaN(timestamp)) {
      return null;
    }
  } else if (Number.isInteger(value)) {
    timestamp = value;
  } else {
    return null;
  }

  const length = `${timestamp}`.length;

  let date: Date;
  if (length === 10) {
    date = new Date(timestamp * 1000);
  } else if (length === 13) {
    date = new Date(timestamp);
  } else {
    return null;
  }

  return date;
};

export const wait = async (ms: number): Promise<void> =>
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
