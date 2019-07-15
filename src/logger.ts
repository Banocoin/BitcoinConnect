import { format, createLogger, transports } from "winston";

const { combine, timestamp, label, colorize } = format;

const isDevelopment = process.env.NODE_ENV !== "production";
const logPath =  process.env.LOG_PATH||".log"

export const logger = createLogger({
  level: "warn",
  format: combine(
    label({ label: "fff" }),
    timestamp(),
    format.printf(info => `<${info.level}>${info.timestamp}:${info.message}`)
  ),
  defaultMeta: { service: "bridgeServces" },
  transports: [new transports.File({ dirname: logPath })]
});
if (isDevelopment) {
  logger.add(
    new transports.Console({
      level: "debug",
      format: combine(
        colorize({ all: true }),
        timestamp(),
        format.printf(
          info => `<${info.level}>${info.timestamp}:${info.message}`
        )
      )
    })
  );
}
