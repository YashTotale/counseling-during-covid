import { join } from "path";

export const ROOT_FOLDER = join(__dirname, "..", "..");

export const LOGS_FOLDER = join(ROOT_FOLDER, "logs");

export const DATA_FOLDER = join(ROOT_FOLDER, "data");

export const STATIC_FOLDER = join(ROOT_FOLDER, "static");

export const HIGH_SCHOOLS_FOLDER = join(DATA_FOLDER, "high-schools");

export const FORM_RESPONSES = join(DATA_FOLDER, "form-responses.json");

export const FORM_QUESTIONS = {
  timestamp: "Timestamp",
  email: "Email Address",
  firstName: "First Name",
  lastName: "Last Name",
  hsName: "High School Name",
  hsCity: "High School City",
  hsState: "High School State",
  hsZip: "High School Zip Code",
  studentWords:
    "What words would you use to describe students in general during COVID?",
  studentLearing:
    "What are some of the ways students have adapted to deal with new forms of learning (online, hybrid, asynchronous, etc.)?",
  studentInteraction:
    "What are some of the ways students have adapted to deal with new forms of social interaction?",
  studentAcademics:
    "Have students academically exceeded, met, or been below your expectations?",
  studentAcademicsExplanation: "Explain your selection to the question above.",
  counselorResponse:
    "What steps have you taken to better interact with students online? (Examples: created online presentations, organized online meetings)",
  consent:
    "Do you consent to your responses being used anonymously in this research project?",
  studentChallenges:
    "What are the major challenges that students you interact with are facing during COVID? ",
  schoolRating:
    "How would you rate your school's measures to improve student mental health and academic performance during COVID?",
};

export const STATE_ABBRS = [
  "AK",
  "AL",
  "AR",
  "AZ",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "IA",
  "ID",
  "IL",
  "IN",
  "KS",
  "KY",
  "LA",
  "MA",
  "MD",
  "ME",
  "MI",
  "MN",
  "MO",
  "MS",
  "MT",
  "NC",
  "ND",
  "NE",
  "NH",
  "NJ",
  "NM",
  "NV",
  "NY",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VA",
  "VT",
  "WA",
  "WI",
  "WV",
  "WY",
];

export const STATE_NAMES = [
  "Alaska",
  "Alabama",
  "Arkansas",
  "Arizona",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Iowa",
  "Idaho",
  "Illinois",
  "Indiana",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Massachusetts",
  "Maryland",
  "Maine",
  "Michigan",
  "Minnesota",
  "Missouri",
  "Mississippi",
  "Montana",
  "North Carolina",
  "North Dakota",
  "Nebraska",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "Nevada",
  "New York",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Virginia",
  "Vermont",
  "Washington",
  "Wisconsin",
  "West Virginia",
  "Wyoming",
];
