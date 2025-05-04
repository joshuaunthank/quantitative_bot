const logLevels = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3,
};

const logLevel = process.env.LOG_LEVEL || "info";
const logLevelValue =
	logLevels[logLevel as keyof typeof logLevels] || logLevels.info;
const log = (level: keyof typeof logLevels, message: any) => {
	if (logLevels[level] >= logLevelValue) {
		const timestamp = new Date().toISOString();
		console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
	}
};
const logger = {
	debug: (message: any) => log("debug", message),
	info: (message: any) => log("info", message),
	warn: (message: any) => log("warn", message),
	error: (message: any) => log("error", message),
};
export default logger;
