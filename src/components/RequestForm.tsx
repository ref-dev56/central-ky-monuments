"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { ColorOptions } from "./ColorGrid";
import ColorPickerDialog from "./ColorPickerDialog";
import Turnstile from "./Turnstile";

export type StoneOption = { sku: string; name: string; image: string };

type Props = {
  stones: StoneOption[];
  phone?: string | null;
  phoneHref?: string;
  submitLabel?: string | null;
  /** Granite colors offered for every design. */
  colorOptions: ColorOptions;
};

type Fields = {
  design: string;
  name: string;
  phone: string;
  email: string;
  contactMethod: "Phone call" | "Text message" | "Email";
  cemetery: string;
  timeline: string;
  message: string;
  website: string; // honeypot: hidden from people, bots fill it in
};

type Errors = Partial<Record<"name" | "phone" | "email", string>>;

const CONTACT_METHODS: Fields["contactMethod"][] = [
  "Phone call",
  "Text message",
  "Email",
];
const TIMELINES = [
  "Just exploring for now",
  "As soon as possible",
  "Within the next 3 months",
  "In 3 to 6 months",
  "More than 6 months out",
];

/** Where submissions go: the Google Apps Script web app URL (set at build time). */
const ENDPOINT = process.env.NEXT_PUBLIC_LEAD_ENDPOINT;
const THANK_YOU = "/request-information/thank-you/";
/** Cloudflare Turnstile site key (public). Without it the spam check is skipped. */
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const inputClass =
  "min-h-12 w-full rounded-md border border-input-border bg-white px-3.5 text-base text-ink " +
  "focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-brand " +
  "aria-invalid:border-red-700";
const labelClass = "text-[15px] font-semibold";
const optional = <span className="font-normal text-muted">(optional)</span>;

/** name@domain.ext: no spaces, one @, and a dot followed by at least 2 letters. */
const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i;

/**
 * Keeps only the 10 digits of a US phone number. A leading 1 or 0 is
 * dropped (no US area code starts with them), so "+1 (859) 555-1234" and
 * "18595551234" both become 8595551234.
 */
function phoneDigits(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/^[01]+/, "")
    .slice(0, 10);
}

/** 859 → "859", 8595 → "859-5", 8595551234 → "859-555-1234" */
function formatPhone(digits: string) {
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** Problems with the phone and email formats (blank is fine here). */
function formatErrors(f: Fields): Errors {
  const errors: Errors = {};
  if (f.phone && phoneDigits(f.phone).length !== 10)
    errors.phone = "Please enter a 10-digit phone number, like 859-555-0123.";
  if (f.email.trim() && !EMAIL.test(f.email.trim()))
    errors.email = "Please enter an email address like name@example.com.";
  return errors;
}

function validate(f: Fields): Errors {
  const errors: Errors = formatErrors(f);
  if (!f.name.trim()) errors.name = "Please enter your name.";
  if (f.contactMethod !== "Email" && !f.phone)
    errors.phone = "Please enter a phone number so we can reach you.";
  if (f.contactMethod === "Email" && !f.email.trim())
    errors.email = "Please enter an email address so we can reach you.";
  return errors;
}

/**
 * Lead form. Arriving from a stone's "Ask about this design" link
 * (?stone=SKU) fills in the design and shows its photo.
 */
export default function RequestForm({
  stones,
  phone,
  phoneHref,
  submitLabel,
  colorOptions,
}: Props) {
  const router = useRouter();
  const [stone, setStone] = useState<StoneOption | null>(null);
  // Granite color (by slug), from ?color= or picked on the form.
  const [colorSlug, setColorSlug] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const colorButton = useRef<HTMLButtonElement>(null);
  const color = colorOptions.colors.find((c) => c.slug === colorSlug) ?? null;
  const [fields, setFields] = useState<Fields>({
    design: "",
    name: "",
    phone: "",
    email: "",
    contactMethod: "Phone call",
    cemetery: "",
    timeline: "",
    message: "",
    website: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<
    "idle" | "sending" | "failed" | "verifying"
  >("idle");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);
  // True once a send has taken longer than ~2 seconds (Apps Script can be slow to start).
  const [slow, setSlow] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const onToken = useCallback((token: string | null) => {
    setTurnstileToken(token);
    // Clear the "still checking" message once the check finishes.
    if (token) setStatus((s) => (s === "verifying" ? "idle" : s));
  }, []);

  // Static pages can't read the query string on the server, so pick up
  // ?stone= once in the browser.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("color")?.toLowerCase();
    if (slug && colorOptions.colors.some((c) => c.slug === slug)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setColorSlug(slug);
    }
    const sku = params.get("stone");
    const match =
      sku && stones.find((s) => s.sku.toLowerCase() === sku.toLowerCase());
    if (!match) return;
    setStone(match);
    setFields((f) => ({ ...f, design: `${match.name} – ${match.sku}` }));
  }, [stones, colorOptions.colors]);

  useEffect(() => {
    if (status !== "sending") return;
    const timer = window.setTimeout(() => setSlow(true), 2000);
    return () => {
      window.clearTimeout(timer);
      setSlow(false);
    };
  }, [status]);

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((f) => ({ ...f, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  /** Formats the phone as the visitor types (859-555-0123), keeping the cursor in place. */
  const onPhoneChange = (input: HTMLInputElement) => {
    const caret = input.selectionStart ?? input.value.length;
    const digitsBeforeCaret = phoneDigits(input.value.slice(0, caret)).length;
    const formatted = formatPhone(phoneDigits(input.value));
    set("phone", formatted);
    // Put the cursor back after the same number of digits.
    requestAnimationFrame(() => {
      let pos = 0;
      for (
        let seen = 0;
        pos < formatted.length && seen < digitsBeforeCaret;
        pos++
      ) {
        if (/\d/.test(formatted[pos])) seen++;
      }
      if (document.activeElement === input) input.setSelectionRange(pos, pos);
    });
  };

  /** Checks a field's format when the visitor moves on from it. */
  const checkFormat = (key: "phone" | "email") => {
    const problem = formatErrors(fields)[key];
    if (problem) setErrors((e) => ({ ...e, [key]: problem }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate(fields);
    setErrors(found);
    const first = (["name", "phone", "email"] as const).find((k) => found[k]);
    if (first) {
      form.current?.querySelector<HTMLInputElement>(`#${first}`)?.focus();
      return;
    }

    // Bots that fill the hidden field get a convincing "thank you".
    if (fields.website) return router.push(THANK_YOU);

    const {
      design,
      name,
      phone,
      email,
      contactMethod,
      cemetery,
      timeline,
      message,
    } = fields;
    const payload = {
      design,
      name,
      phone,
      email: email.trim(),
      contactMethod,
      cemetery,
      timeline,
      message,
      sku: stone && design.includes(stone.sku) ? stone.sku : "",
      color: color
        ? `${color.name}${color.group === "special" ? " (special order)" : ""}`
        : "",
      page: window.location.href,
      turnstileToken,
    };

    if (!ENDPOINT) {
      if (process.env.NODE_ENV === "development") {
        console.info(
          "[RequestForm] No NEXT_PUBLIC_LEAD_ENDPOINT set; would send:",
          payload,
        );
        return router.push(THANK_YOU);
      }
      setStatus("failed");
      return;
    }

    // The spam check usually finishes while the visitor is typing.
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setStatus("verifying");
      return;
    }

    setStatus("sending");
    try {
      // text/plain keeps this a "simple" request, which Apps Script accepts
      // without a CORS preflight.
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
      } | null;
      if (!res.ok || !data?.ok) throw new Error("Lead was not saved");
      router.push(THANK_YOU);
    } catch {
      setStatus("failed");
      // Each Turnstile token works once, so get a fresh one for the retry.
      setTurnstileReset((n) => n + 1);
    }
  }

  const errorProps = (key: keyof Errors) =>
    errors[key]
      ? { "aria-invalid": true, "aria-describedby": `${key}-error` }
      : {};
  const errorText = (key: keyof Errors) =>
    errors[key] && (
      <span id={`${key}-error`} className="text-sm font-medium text-red-800">
        {errors[key]}
      </span>
    );

  return (
    <form
      ref={form}
      noValidate
      onSubmit={onSubmit}
      className="flex flex-col gap-6"
    >
      {/* Design of interest: highlighted and pictured when it came from a stone */}
      <div
        className={`flex flex-col gap-2.5 ${stone ? "rounded-[10px] bg-sage-tint p-4.5" : ""}`}
      >
        <label htmlFor="design" className={labelClass}>
          Design of interest {!stone && optional}
        </label>
        <div className="flex items-center gap-3.5">
          {stone && (
            <Image
              src={stone.image}
              alt=""
              width={64}
              height={80}
              className="h-20 w-16 shrink-0 rounded object-cover"
            />
          )}
          <input
            id="design"
            type="text"
            value={fields.design}
            onChange={(e) => set("design", e.target.value)}
            placeholder={
              stone
                ? undefined
                : "e.g. a design name or number from our gallery"
            }
            className={inputClass}
          />
        </div>
        {stone && (
          <span className="text-[13px] text-body">
            Filled in from the design you were viewing. Change or clear it if
            you&rsquo;re still deciding.
          </span>
        )}
      </div>

      {colorOptions.colors.length > 0 && (
        <div className="flex flex-col gap-2">
          <span id="color-label" className={labelClass}>
            Granite color {optional}
          </span>
          {color ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Image
                src={color.image}
                alt=""
                width={200}
                height={120}
                sizes="96px"
                className="h-12 w-20 rounded-md object-cover ring-1 ring-ink/10"
              />
              <span className="text-base font-medium text-ink">
                {color.name}
                {color.group === "special" && (
                  <span className="ml-2 text-sm font-normal text-muted">
                    Special order
                  </span>
                )}
              </span>
              <span className="flex gap-4">
                <button
                  ref={colorButton}
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  aria-describedby="color-label"
                  className="min-h-11 text-sm text-link underline hover:text-ink"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setColorSlug(null);
                    requestAnimationFrame(() => colorButton.current?.focus());
                  }}
                  className="min-h-11 text-sm text-link underline hover:text-ink"
                >
                  Remove
                </button>
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <button
                ref={colorButton}
                type="button"
                onClick={() => setPickerOpen(true)}
                aria-describedby="color-label"
                className="inline-flex min-h-12 items-center rounded-md border border-input-border bg-white px-4 text-base text-ink hover:border-brand"
              >
                Choose a color
              </button>
              <span className="text-[13px] text-muted">
                Not sure yet? Leave it blank.
              </span>
            </div>
          )}
          {pickerOpen && (
            <ColorPickerDialog
              {...colorOptions}
              selected={colorSlug}
              onSelect={setColorSlug}
              onClose={() => {
                setPickerOpen(false);
                requestAnimationFrame(() => colorButton.current?.focus());
              }}
            />
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className={labelClass}>
          Your name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          value={fields.name}
          onChange={(e) => set("name", e.target.value)}
          className={inputClass}
          {...errorProps("name")}
        />
        {errorText("name")}
      </div>

      <fieldset className="flex flex-col">
        <legend className={`${labelClass} mb-2`}>Best way to reach you</legend>
        <div className="flex flex-wrap gap-x-7">
          {CONTACT_METHODS.map((method) => (
            <label
              key={method}
              className="flex min-h-11 items-center gap-2 text-base"
            >
              <input
                type="radio"
                name="contactMethod"
                value={method}
                checked={fields.contactMethod === method}
                onChange={() => {
                  set("contactMethod", method);
                  setErrors({ ...errors, phone: undefined, email: undefined });
                }}
                className="size-5 accent-brand"
              />
              {method}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className={labelClass}>
            Phone {fields.contactMethod === "Email" && optional}
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="859-555-0123"
            value={fields.phone}
            onChange={(e) => onPhoneChange(e.target)}
            onBlur={() => checkFormat("phone")}
            className={inputClass}
            {...errorProps("phone")}
          />
          {errorText("phone")}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className={labelClass}>
            Email {fields.contactMethod !== "Email" && optional}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={fields.email}
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => checkFormat("email")}
            className={inputClass}
            {...errorProps("email")}
          />
          {errorText("email")}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="cemetery" className={labelClass}>
            Cemetery {optional}
          </label>
          <input
            id="cemetery"
            type="text"
            value={fields.cemetery}
            onChange={(e) => set("cemetery", e.target.value)}
            placeholder="e.g. Frankfort Cemetery"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="timeline" className={labelClass}>
            Timeline {optional}
          </label>
          <select
            id="timeline"
            value={fields.timeline}
            onChange={(e) => set("timeline", e.target.value)}
            className={`${inputClass} px-3`}
          >
            <option value="">Choose one</option>
            {TIMELINES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className={labelClass}>
          Anything you&rsquo;d like us to know? {optional}
        </label>
        <textarea
          id="message"
          rows={5}
          value={fields.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Names and dates, a color you have in mind, or questions about the process."
          className={`${inputClass} resize-y py-3 leading-normal`}
        />
      </div>

      {/* Honeypot: off-screen and skipped by keyboard and screen readers */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={fields.website}
          onChange={(e) => set("website", e.target.value)}
        />
      </div>

      <p className="text-[13px] leading-relaxed text-muted">
        We use your details only to respond to this request and never share
        them. See our{" "}
        <Link href="/privacy/" className="text-link underline hover:text-ink">
          privacy policy
        </Link>
        .
      </p>

      {TURNSTILE_SITE_KEY && (
        <Turnstile
          siteKey={TURNSTILE_SITE_KEY}
          onToken={onToken}
          resetSignal={turnstileReset}
        />
      )}

      {status === "verifying" && (
        <div
          role="status"
          className="rounded-md border border-border bg-stone p-4 text-[15px] text-body"
        >
          We&rsquo;re running a quick spam check. Please press Send again in a
          moment
          {phone && phoneHref ? (
            <>
              , or call us at{" "}
              <a href={phoneHref} className="font-semibold underline">
                {phone}
              </a>
            </>
          ) : null}
          .
        </div>
      )}

      {status === "failed" && (
        <div
          role="alert"
          className="rounded-md border border-red-800/30 bg-red-50 p-4 text-[15px] text-red-900"
        >
          Sorry, your request didn&rsquo;t go through. Please try again
          {phone && phoneHref ? (
            <>
              {" "}
              or call us at{" "}
              <a href={phoneHref} className="font-semibold underline">
                {phone}
              </a>
            </>
          ) : null}
          .
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={status === "sending"}
          aria-describedby={slow ? "sending-note" : undefined}
          className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-md bg-brand px-8 text-base font-medium text-white hover:bg-ink disabled:cursor-wait disabled:opacity-80 max-sm:w-full"
        >
          {status === "sending" && (
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
          )}
          {status === "sending"
            ? "Sending\u2026"
            : submitLabel || "Send request"}
        </button>
        {/* Announced to screen readers as well as shown */}
        <p
          id="sending-note"
          role="status"
          className="mt-3 min-h-5 text-sm text-muted"
        >
          {slow &&
            "This can take a few seconds. Please don\u2019t close the page."}
        </p>
      </div>
    </form>
  );
}
