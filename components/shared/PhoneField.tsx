"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { PhoneInput } from "react-international-phone";
import type { CountryIso2 } from "react-international-phone";

import { cn } from "@/lib/utils/cn";
import {
  getPhoneCountry,
  inferPhoneCountry,
  toPhoneSelection,
} from "@/lib/utils/phone";
import type { PhoneSelection } from "@/lib/utils/phone";

interface PhoneFieldProps {
  className?: string;
  error?: string;
  id: string;
  onChange: (value: string, country: PhoneSelection) => void;
  value: string;
}

export default function PhoneField({
  className,
  error,
  id,
  onChange,
  value,
}: PhoneFieldProps): ReactElement {
  const [selectedCountryIso2, setSelectedCountryIso2] = useState<CountryIso2>(
    "ke",
  );

  useEffect((): void => {
    if (!value.trim()) {
      return;
    }

    setSelectedCountryIso2(
      inferPhoneCountry(value).code.toLowerCase() as CountryIso2,
    );
  }, [value]);

  return (
    <div className={cn("space-y-2", className)}>
      <PhoneInput
        className={cn(
          "relative flex h-12 w-full items-stretch overflow-visible focus-within:z-20",
        )}
        countrySelectorStyleProps={{
          buttonClassName:
            cn(
              "h-12 self-stretch rounded-l-lg border border-r-0 !bg-ivory px-4 text-obsidian transition-colors hover:!bg-cream",
              error
                ? "border-error"
                : "border-border-warm focus-within:border-gold",
            ),
          dropdownArrowClassName: "text-text-muted",
          dropdownStyleProps: {
            className:
              "z-30 mt-2 max-h-64 overflow-y-auto rounded-lg border border-border-warm bg-ivory text-obsidian shadow-card",
            listItemClassName:
              "font-dm-sans text-body-sm text-obsidian focus:bg-cream focus:text-obsidian",
            listItemDialCodeClassName: "font-dm-sans text-caption text-text-muted",
            listItemCountryNameClassName: "font-dm-sans text-body-sm text-obsidian",
            preferredListDividerClassName: "bg-border-warm",
          },
          flagClassName: "size-5",
        }}
        defaultCountry={selectedCountryIso2}
        forceDialCode
        inputClassName={cn(
          "h-12 w-full rounded-r-lg border !bg-ivory px-4 font-dm-sans text-body-sm text-obsidian placeholder:text-text-muted focus:outline-none focus:ring-0 focus-visible:ring-0",
          error
            ? "border-error"
            : "border-border-warm focus:border-gold focus-visible:border-gold",
        )}
        inputProps={{
          autoComplete: "tel-national",
          id,
          name: id,
        }}
        onChange={(nextPhone, meta): void => {
          setSelectedCountryIso2(meta.country.iso2);
          onChange(nextPhone, toPhoneSelection(meta.country));
        }}
        placeholder={
          value
            ? inferPhoneCountry(value).exampleNational
            : getPhoneCountry(selectedCountryIso2.toUpperCase()).exampleNational
        }
        value={value}
      />
      {error ? (
        <p className="font-dm-sans text-caption text-error">{error}</p>
      ) : null}
    </div>
  );
}
