// Externals
import axios from "axios";
import { readFile, rm, writeFile } from "fs/promises";
import mkdirp from "mkdirp";
import { join } from "path";
import Logger from "@hack4impact/logger";
import { format } from "prettier";

// Internals
import {
  HIGH_SCHOOLS_FOLDER,
  LOGS_FOLDER,
  STATE_ABBRS,
  STATE_NAMES,
} from "./utils/constants";
import { School } from "./utils/types";
import { setUp } from "./utils/helpers";

interface RawSchool {
  attributes: Record<string, string | number>;
}

const getStateHighSchools = async (
  stateAbbreviation: string,
  stateName: string
) => {
  const response = await axios.get(
    `https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Public_Schools/FeatureServer/0/query?where=LEVEL_%20%3D%20'HIGH'%20AND%20COUNTRY%20%3D%20'USA'%20AND%20ST_GRADE%20%3D%20'09'%20AND%20STATE%20%3D%20'${stateAbbreviation}'&outFields=*&outSR=4326&f=json`
  );

  const schools: RawSchool[] = response.data.features;

  const schoolData: Record<number, School> = schools.reduce(
    (data, schoolObj) => {
      const attrs = schoolObj.attributes;

      return {
        ...data,
        [attrs["OBJECTID"]]: {
          name: attrs["NAME"],
          address: attrs["ADDRESS"],
          city: attrs["CITY"],
          county: attrs["COUNTY"],
          zip: attrs["ZIP"],
          enrollment: attrs["ENROLLMENT"] < 0 ? null : attrs["ENROLLMENT"],
          website:
            attrs["WEBSITE"] === "NOT AVAILABLE" ? null : attrs["WEBSITE"],
        },
      };
    },
    {}
  );

  const formatted = format(JSON.stringify(schoolData), {
    parser: "json-stringify",
  });

  await writeFile(
    join(HIGH_SCHOOLS_FOLDER, `${stateName}.json`),
    formatted,
    "utf-8"
  );

  Logger.success(`Got ${stateName} (${stateAbbreviation}) high schools!`);
};

const getHighSchools = async () => {
  await setUp();
  await mkdirp(HIGH_SCHOOLS_FOLDER);

  const indexPath = join(LOGS_FOLDER, "high-school-index.txt");

  let i: number;
  try {
    const index = await readFile(indexPath, "utf-8");
    i = parseInt(index);
  } catch (e) {
    i = 0;
  }

  for (; i < STATE_ABBRS.length; i++) {
    await getStateHighSchools(STATE_ABBRS[i], STATE_NAMES[i]);
    await writeFile(indexPath, (i + 1).toString(), "utf-8");
  }

  await rm(indexPath);
};

const maxRetries = 3;

const withRetries = async (retries: number) => {
  try {
    await getHighSchools();
  } catch (e) {
    Logger.error(`An error occurred (${e.message})`);

    if (retries >= maxRetries) {
      Logger.error("Max Retries attempted. Exiting...");
      process.exit(1);
    } else {
      console.log("Retrying...");
      withRetries(retries + 1);
    }
  }
};

withRetries(0);
