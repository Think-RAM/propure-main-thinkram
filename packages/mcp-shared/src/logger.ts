import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

const baseOptions = {
  name: "propure-shared",
  level: process.env.LOG_LEVEL || (isProd ? "info" : "debug"),
};

const transport = isProd
  ? undefined
  : pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
      },
    });

export const logger = pino(baseOptions, transport);

export const createChildLogger = (
  bindings: pino.Bindings = {},
  options?: pino.ChildLoggerOptions,
) => logger.child(bindings, options);
