// Externals
import { config } from "dotenv-safe";
config();
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { promisify } from "util";
import readline, { createInterface } from "readline";
import Logger from "@hack4impact/logger";
import { google, Auth } from "googleapis";

// Internals
import { ROOT_FOLDER } from "./constants";

readline.Interface.prototype.question[promisify.custom] = function (
  prompt: string
) {
  return new Promise((resolve) =>
    readline.Interface.prototype.question.call(this, prompt, resolve)
  );
};

// @ts-expect-error Defining new method
readline.Interface.prototype.questionAsync = promisify(
  readline.Interface.prototype.question
);

const CRED_PATH = join(ROOT_FOLDER, "credentials.json");
const TOKEN_PATH = join(ROOT_FOLDER, "oauth-token.json");

const googleAuth = async (): Promise<Auth.OAuth2Client> => {
  const keyfile = await readFile(CRED_PATH, "utf-8");
  const creds = JSON.parse(keyfile);

  const oAuth2Client = new google.auth.OAuth2(
    creds.installed.client_id,
    creds.installed.client_secret,
    creds.installed.redirect_uris[0]
  );

  Logger.log("Authorizing...");

  let token: Auth.Credentials;
  try {
    const rawToken = await readFile(TOKEN_PATH, "utf-8");
    token = JSON.parse(rawToken);
    oAuth2Client.setCredentials(token);
  } catch (e) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/spreadsheets",
      ],
    });

    Logger.line();
    Logger.log(
      `${Logger.COLORS.FgBlue}Authorize by signing in with ${process.env.MAIL_USERNAME}${Logger.COLORS.Reset}: ${authUrl}`
    );

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    Logger.line();
    // @ts-expect-error Defined method at the top of the file
    const code = await rl.questionAsync("Enter the code from that page here: ");

    rl.close();

    const { tokens } = await oAuth2Client.getToken(code);
    token = tokens;

    oAuth2Client.setCredentials(token);

    await writeFile(TOKEN_PATH, JSON.stringify(token));

    Logger.success(`Token stored at ${TOKEN_PATH}`);
    Logger.line();
  }
  Logger.success("Authorized!");
  return oAuth2Client;
};

export default googleAuth;
