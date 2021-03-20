// Externals
import { config } from "dotenv-safe";
config();
import Logger from "@hack4impact/logger";
import { writeFile } from "fs/promises";
import { google } from "googleapis";
import { format } from "prettier";

// Internals
import googleAuth from "./utils/google-auth";
import {
  FORM_QUESTIONS,
  FORM_RESPONSES,
  SPREADSHEET_ID,
  SPREADSHEET_TABLES,
} from "./utils/constants";

type FormResponse = Record<string, FormattedValue>;

const getFormResponses = async () => {
  const oAuth2Client = await googleAuth();

  const sheets = google.sheets({
    version: "v4",
    auth: oAuth2Client,
  });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: SPREADSHEET_TABLES.formResponses,
  });

  const values: string[][] = response.data.values ?? [];

  const keys: string[] = values.splice(0, 1)[0];

  const formResponses = values.reduce((arr, formResponse) => {
    const responseObj = formResponse.reduce(
      (obj, value, i) => ({ ...obj, [keys[i]]: formatValue(keys[i], value) }),
      {}
    );

    return [...arr, responseObj];
  }, [] as FormResponse[]);

  const formatted = format(JSON.stringify(formResponses), {
    parser: "json-stringify",
  });

  await writeFile(FORM_RESPONSES, formatted, "utf-8");

  Logger.success("Got form responses!");
};

type FormattedValue = string | number | null | string[];

const formatValue = (key: string, value: string): FormattedValue => {
  let formatted: FormattedValue;

  switch (key) {
    case FORM_QUESTIONS.studentWords: {
      formatted = value.split(", ");
      break;
    }
    case FORM_QUESTIONS.hsZip:
    case FORM_QUESTIONS.schoolRating: {
      formatted = parseInt(value);
      break;
    }
    default: {
      formatted = value.length ? value : null;
    }
  }

  return formatted;
};

getFormResponses();
