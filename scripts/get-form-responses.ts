// Externals
import Logger from "@hack4impact/logger";
import { writeFile } from "fs/promises";
import { google } from "googleapis";
import { format } from "prettier";
import { FORM_QUESTIONS, FORM_RESPONSES } from "./utils/constants";

// Internals
import googleAuth from "./utils/google-auth";

const getFormResponses = async () => {
  const oAuth2Client = await googleAuth();

  const sheets = google.sheets({
    version: "v4",
    auth: oAuth2Client,
  });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: "1er3A0lKwR8fo0p2-8y_hv2ZL2NTeG2RPaK_9HPiXu-8",
    range: "Form Responses",
  });

  const values = response.data.values ?? [];

  const keys = values.splice(0, 1)[0];

  const formResponses = values.reduce((arr, formResponse) => {
    const responseObj = formResponse.reduce(
      (obj, value, i) => ({ ...obj, [keys[i]]: formatValue(keys[i], value) }),
      {}
    );

    return [...arr, responseObj];
  }, []);

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
