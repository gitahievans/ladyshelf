import { defaultCountries, parseCountry } from "react-international-phone";
import type { ParsedCountry } from "react-international-phone";

export interface PhoneCountry {
  code: string;
  dialCode: string;
  exampleNational: string;
  name: string;
  nationalLength?: number;
  stripLeadingZero?: boolean;
  validationPattern?: RegExp;
}

export interface PhoneSelection {
  dialCode: string;
  format?: string;
  iso2: string;
  name: string;
}

export const phoneCountries: PhoneCountry[] = [
  {
    code: "KE",
    dialCode: "+254",
    exampleNational: "712345678",
    name: "Kenya",
    nationalLength: 9,
    stripLeadingZero: true,
    validationPattern: /^(7|1)\d{8}$/,
  },
  {
    code: "UG",
    dialCode: "+256",
    exampleNational: "712345678",
    name: "Uganda",
    nationalLength: 9,
    stripLeadingZero: true,
    validationPattern: /^7\d{8}$/,
  },
  {
    code: "TZ",
    dialCode: "+255",
    exampleNational: "712345678",
    name: "Tanzania",
    nationalLength: 9,
    stripLeadingZero: true,
    validationPattern: /^(6|7)\d{8}$/,
  },
  {
    code: "RW",
    dialCode: "+250",
    exampleNational: "788123456",
    name: "Rwanda",
    nationalLength: 9,
    stripLeadingZero: true,
  },
  {
    code: "ET",
    dialCode: "+251",
    exampleNational: "911234567",
    name: "Ethiopia",
    nationalLength: 9,
    stripLeadingZero: true,
  },
  {
    code: "NG",
    dialCode: "+234",
    exampleNational: "8123456789",
    name: "Nigeria",
    nationalLength: 10,
    stripLeadingZero: true,
  },
  {
    code: "GH",
    dialCode: "+233",
    exampleNational: "231234567",
    name: "Ghana",
    nationalLength: 9,
    stripLeadingZero: true,
  },
  {
    code: "ZA",
    dialCode: "+27",
    exampleNational: "821234567",
    name: "South Africa",
    nationalLength: 9,
    stripLeadingZero: true,
  },
  {
    code: "GB",
    dialCode: "+44",
    exampleNational: "7400123456",
    name: "United Kingdom",
    nationalLength: 10,
    stripLeadingZero: true,
  },
  {
    code: "US",
    dialCode: "+1",
    exampleNational: "2025550123",
    name: "United States",
    nationalLength: 10,
  },
  {
    code: "CA",
    dialCode: "+1",
    exampleNational: "4165550123",
    name: "Canada",
    nationalLength: 10,
  },
  {
    code: "IN",
    dialCode: "+91",
    exampleNational: "9123456789",
    name: "India",
    nationalLength: 10,
    stripLeadingZero: true,
  },
  {
    code: "AE",
    dialCode: "+971",
    exampleNational: "501234567",
    name: "United Arab Emirates",
    nationalLength: 9,
    stripLeadingZero: true,
  },
] as const;

export const defaultPhoneCountry = phoneCountries[0];

function getDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function getPhoneCountry(code: string): PhoneCountry {
  return (
    phoneCountries.find((country) => country.code === code) ?? defaultPhoneCountry
  );
}

function getMaskLength(format?: string): number | undefined {
  if (!format) {
    return undefined;
  }

  const digitSlots = format.match(/\./g);

  return digitSlots?.length;
}

export function toPhoneSelection(country: ParsedCountry): PhoneSelection {
  return {
    dialCode: country.dialCode,
    format: typeof country.format === "string" ? country.format : undefined,
    iso2: country.iso2,
    name: country.name,
  };
}

function inferGenericPhoneSelection(value: string): PhoneSelection | undefined {
  const digits = getDigits(value);
  const parsedCountries = defaultCountries
    .map((country) => parseCountry(country))
    .sort((first, second) => second.dialCode.length - first.dialCode.length);

  const matchedCountry = parsedCountries.find((country) =>
    digits.startsWith(country.dialCode),
  );

  return matchedCountry ? toPhoneSelection(matchedCountry) : undefined;
}

function resolvePhoneCountry(
  value: string,
  selection?: PhoneSelection,
): PhoneCountry {
  const effectiveSelection = selection ?? inferGenericPhoneSelection(value);

  if (!effectiveSelection) {
    return inferPhoneCountry(value);
  }

  const curatedCountry = phoneCountries.find(
    (country) => country.code === effectiveSelection.iso2.toUpperCase(),
  );

  if (curatedCountry) {
    return curatedCountry;
  }

  return {
    code: effectiveSelection.iso2.toUpperCase(),
    dialCode: `+${effectiveSelection.dialCode}`,
    exampleNational: "",
    name: effectiveSelection.name,
    nationalLength: getMaskLength(effectiveSelection.format),
  };
}

export function inferPhoneCountry(value: string): PhoneCountry {
  const digits = getDigits(value);
  const countriesByDialCodeLength = [...phoneCountries].sort(
    (first, second) => second.dialCode.length - first.dialCode.length,
  );

  return (
    countriesByDialCodeLength.find((country) =>
      digits.startsWith(getDigits(country.dialCode)),
    ) ?? defaultPhoneCountry
  );
}

export function getNationalPhoneInput(
  value: string,
  country: PhoneCountry,
): string {
  let digits = getDigits(value);
  const dialCodeDigits = getDigits(country.dialCode);

  if (digits.startsWith(dialCodeDigits)) {
    digits = digits.slice(dialCodeDigits.length);
  }

  if (country.stripLeadingZero && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return digits;
}

export function buildInternationalPhone(
  country: PhoneCountry,
  value: string,
): string {
  const nationalNumber = getNationalPhoneInput(value, country);

  if (!nationalNumber) {
    return "";
  }

  return `${country.dialCode}${nationalNumber}`;
}

export function getPhoneExample(country: PhoneCountry): string {
  return country.exampleNational
    ? `${country.dialCode} ${country.exampleNational}`
    : country.dialCode;
}

interface ValidatePhoneOptions {
  required?: boolean;
  requiredMessage?: string;
}

function getLivePatternError(
  nationalNumber: string,
  country: PhoneCountry,
): string | undefined {
  if (!country.validationPattern || !nationalNumber) {
    return undefined;
  }

  if (country.code === "KE" && !/^[71]/.test(nationalNumber)) {
    return "Kenya numbers should start with 7 or 1 after +254.";
  }

  if (country.code === "UG" && !/^7/.test(nationalNumber)) {
    return "Uganda numbers should start with 7 after +256.";
  }

  if (country.code === "TZ" && !/^[67]/.test(nationalNumber)) {
    return "Tanzania numbers should start with 6 or 7 after +255.";
  }

  return undefined;
}

export function validateInternationalPhoneLive(
  value: string,
  selection?: PhoneSelection,
): string | undefined {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  const country = resolvePhoneCountry(trimmedValue, selection);
  const nationalNumber = getNationalPhoneInput(trimmedValue, country);

  if (!nationalNumber) {
    return undefined;
  }

  if (
    typeof country.nationalLength === "number" &&
    nationalNumber.length > country.nationalLength
  ) {
    return `${country.name} phone numbers should have ${country.nationalLength} digits after ${country.dialCode}.`;
  }

  const livePatternError = getLivePatternError(nationalNumber, country);

  if (livePatternError) {
    return livePatternError;
  }

  if (
    typeof country.nationalLength === "number" &&
    nationalNumber.length === country.nationalLength
  ) {
    return validateInternationalPhone(trimmedValue, {}, selection);
  }

  return undefined;
}

export function validateInternationalPhone(
  value: string,
  options: ValidatePhoneOptions = {},
  selection?: PhoneSelection,
): string | undefined {
  const trimmedValue = value.trim();
  const required = options.required ?? false;

  if (!trimmedValue) {
    return required ? options.requiredMessage ?? "Please enter a phone number." : undefined;
  }

  const country = resolvePhoneCountry(trimmedValue, selection);
  const nationalNumber = getNationalPhoneInput(trimmedValue, country);

  if (
    typeof country.nationalLength === "number" &&
    nationalNumber.length !== country.nationalLength
  ) {
    return `${country.name} phone numbers should have ${country.nationalLength} digits after ${country.dialCode}.`;
  }

  if (
    country.validationPattern &&
    !country.validationPattern.test(nationalNumber)
  ) {
    return `Please enter a valid ${country.name} number. Example: ${getPhoneExample(country)}.`;
  }

  return undefined;
}
