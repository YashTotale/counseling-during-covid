// Externals
import { config } from "dotenv-safe";
config();
import { readFile } from "fs/promises";
import { join } from "path";
import { google, Auth, sheets_v4 } from "googleapis";
import { createTransport } from "nodemailer";
import Logger from "@hack4impact/logger";

// Internals
import googleAuth from "./utils/google-auth";
import {
  SPREADSHEET_ID,
  SPREADSHEET_TABLES,
  STATIC_FOLDER,
} from "./utils/constants";
import { escapeRegex } from "./utils/helpers";

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
      to: counselor.email,
      subject:
        "Request for Participation: Counseling During COVID Research Project",
      html: content,
    });

    await afterSend(counselor);

    Logger.success("Sent email!");
  }
};

const afterSend = async (counselor: Counselor) => {
  await sheetsAPI.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: SPREADSHEET_TABLES.askedCounselors,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [Object.values(counselor)],
    },
  });
};

const getMailContent = (template: string, counselor: Counselor) => {
  let content = template;

  Object.entries(counselor).forEach(([key, value]) => {
    if (!value.length) throw new Error(`No ${key} found for counselor`);

    content = content.replace(
      new RegExp(escapeRegex(`{{${key}}}`), "g"),
      value.trim()
    );
  });

  const search = content.match(/\{\{(.*)\}\}/);

  if (search !== null) {
    throw new Error(`Unresolved template variable '${search[1]}'`);
  }

  return content;
};

const getCounselorsToEmail = async () => {
  if (!oAuth2Client) {
    oAuth2Client = await googleAuth();
    sheetsAPI = google.sheets({
      version: "v4",
      auth: oAuth2Client,
    });
  }

  const { data: counselorData } = await sheetsAPI.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: SPREADSHEET_TABLES.counselors,
  });

  const { data: askedCounselorData } = await sheetsAPI.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: SPREADSHEET_TABLES.askedCounselors,
  });

  const rawCounselors: string[][] = counselorData.values ?? [];
  const rawAskedCounselors: string[][] = askedCounselorData.values ?? [];

  const keys = rawCounselors.splice(0, 1)[0];

  const counselors = rawCounselors.reduce((arr, counselor) => {
    if (counselor.length === 0) return arr;

    const isAsked = rawAskedCounselors.find(
      (asked) => JSON.stringify(asked) === JSON.stringify(counselor)
    );

    if (isAsked) return arr;

    const counselorObj = counselor.reduce((obj, value, i) => {
      const key = keys[i].toLowerCase().replace(" ", "-");

      return { ...obj, [key]: value };
    }, {});

    return [...arr, counselorObj];
  }, [] as Counselor[]);

  return counselors;
};

const getMailTemplate = () => {
  return readFile(join(STATIC_FOLDER, "mail-template.html"), "utf-8");
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

sendEmails();
