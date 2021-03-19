// Externals
import mkdirp from "mkdirp";

// Internals
import { DATA_FOLDER, LOGS_FOLDER } from "./constants";

export const setUp = async () => {
  await mkdirp(DATA_FOLDER);
  await mkdirp(LOGS_FOLDER);
};

export const sleep = (ms: number) => {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
};
