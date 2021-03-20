// Externals
import { config } from "dotenv-safe";
config();
import { readFile } from "fs/promises";
import { join } from "path";
import { google, Auth, sheets_v4 } from "googleapis";
import { createTransport } from "nodemailer";

// Internals
import googleAuth from "./utils/google-auth";
import { STATIC_FOLDER } from "./utils/constants";
import { escapeRegex } from "./utils/helpers";
import Logger from "@hack4impact/logger";

let oAuth2Client: Auth.OAuth2Client;
let sheetsAPI: sheets_v4.Sheets;

type Counselor = Record<string, string>;

const sendEmails = async () => {
  const transporter = setUpTransport();

  const [template, counselors] = await Promise.all([
    getMailTemplate(),
    getCounselorsToEmail(),
  ]);

  for (const counselor of counselors) {
    const content = getMailContent(template, counselor);

    await transporter.sendMail({
      from: process.env.MAIL_USERNAME,
      to: process.env.MAIL_USERNAME,
      subject:
        "Request for Participation: Counseling During COVID Research Project",
      html: content,
    });

    Logger.success(`Sent email!`);
  }
};

const setUpTransport = () => {
  return createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });
};

const getMailTemplate = () => {
  return readFile(join(STATIC_FOLDER, "mail-template.html"), "utf-8");
};

const getCounselorsToEmail = async () => {
  if (!oAuth2Client) {
    oAuth2Client = await googleAuth();
    sheetsAPI = google.sheets({
      version: "v4",
      auth: oAuth2Client,
    });
  }

  const response = await sheetsAPI.spreadsheets.values.get({
    spreadsheetId: "1er3A0lKwR8fo0p2-8y_hv2ZL2NTeG2RPaK_9HPiXu-8",
    range: "Counselors",
  });

  const values: string[][] = response.data.values ?? [];

  const keys: string[] = values.splice(0, 1)[0];

  const counselors = values.reduce((arr, counselor) => {
    const counselorObj = counselor.reduce((obj, value, i) => {
      const key = keys[i].toLowerCase().replace(" ", "-");

      return { ...obj, [key]: value };
    }, {});

    return [...arr, counselorObj];
  }, [] as Counselor[]);

  return counselors;
};

const getMailContent = (template: string, counselor: Counselor) => {
  let content = template;

  Object.entries(counselor).forEach(([key, value]) => {
    content = content.replace(
      new RegExp(escapeRegex(`{{${key}}}`), "g"),
      value
    );
  });

  return content;
};

sendEmails();
