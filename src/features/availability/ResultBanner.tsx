import { CircleCheck as CheckCircle2, CircleX as XCircle } from "lucide-react";
import type { CheckResult } from "@/types";
import { reasonLabel } from "@/lib/availability";

interface ResultBannerProps {
  result: CheckResult;
}

export default function ResultBanner({ result }: ResultBannerProps) {
  return (
    <section
      className={`rounded-xl border p-4 sm:p-5 transition-all ${
        result.isAvailable
          ? "border-emerald-300 bg-emerald-50"
          : "border-rose-300 bg-rose-50"
      }`}
    >
      <div className="flex items-start gap-3">
        {result.isAvailable ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        ) : (
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={`text-sm font-bold ${
                result.isAvailable
                  ? "text-emerald-800"
                  : "text-rose-800"
              }`}
            >
              {result.isAvailable ? "Available" : "Unavailable"}
            </p>
            {!result.isAvailable && (
              <span className="rounded-full bg-rose-200/70 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                {reasonLabel(result.reasonCategory)}
              </span>
            )}
          </div>
          <p
            className={`mt-1 text-sm leading-relaxed ${
              result.isAvailable
                ? "text-emerald-700"
                : "text-rose-700"
            }`}
          >
            {result.reason}
          </p>
        </div>
      </div>
    </section>
  );
}
