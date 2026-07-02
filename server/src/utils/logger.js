const isProd = process.env.NODE_ENV === 'production';

function format(level, message, meta) {
  const ts = new Date().toISOString();
  if (meta !== undefined) {
    return `[${ts}] [${level}] ${message} ${JSON.stringify(meta)}`;
  }
  return `[${ts}] [${level}] ${message}`;
}

const logger = {
  info(message, meta)  { console.info(format('INFO',  message, meta)); },
  warn(message, meta)  { console.warn(format('WARN',  message, meta)); },
  error(message, meta) { console.error(format('ERROR', message, meta)); },
};

module.exports = logger;
