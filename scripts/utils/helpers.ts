// Externals
import mkdirp from "mkdirp";

// Internals
import { DATA_FOLDER, LOGS_FOLDER } from "./constants";

export const setUp = async (): Promise<void> => {
  await mkdirp(DATA_FOLDER);
  await mkdirp(LOGS_FOLDER);
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const escapeRegex = (text: string): string => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
