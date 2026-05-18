//beneficiary-list.tsx
import * as React from "react";
import { CheckCircle2, FileText, Upload, X } from "lucide-react";

import type { UploadBulkResponse } from "@/types";
import { useUploadCsvDonors } from "@/queries/donors";

const CSV_TEMPLATE_HEADERS =
  "Name,Phone Number,Gender,Address,Blood Group,Status,Last Contacted Date,Last Donated Date,Total Donations,Rating,Remarks";

function downloadTemplate() {
  const exampleRow =
    "John Doe,9800000001,Male,Kathmandu,O+,active,2024-01-15,2024-01-10,3,4,Regular donor";
  const blob = new Blob([`${CSV_TEMPLATE_HEADERS}\n${exampleRow}\n`], {
    type: "text/csv",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "donors-import-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}


interface ImportCsvModalProps {
  onClose: () => void;
  onSuccess: (result: UploadBulkResponse) => void;
}

export function ImportCsvModal({
  onClose,
  onSuccess,
}: ImportCsvModalProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [result, setResult] = React.useState<UploadBulkResponse | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const { mutate, isPending, isError, error, reset } = useUploadCsvDonors();

  function pickFile(picked: File | null | undefined) {
    if (!picked) return;
    if (!picked.name.toLowerCase().endsWith(".csv")) return;
    reset();
    setResult(null);
    setFile(picked);
  }

  const errorMessage =
    error instanceof Error ? error.message : String(error ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-[420px] overflow-hidden rounded-[20px] border border-gray-400 bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-400 px-6 py-4">
          <h2 className="text-sm font-bold tracking-wide text-[#1a1a1a] uppercase">
            Import Donor in Bulk
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[20px] p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {/* CSV format hint */}
          <div className="rounded-[3px] border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-600">Required columns: <span className="font-normal">Name, Phone Number, Blood Group</span></p>
            <p className="font-semibold text-gray-600">Optional columns: <span className="font-normal">Gender, Address, Status, Last Contacted Date, Last Donated Date, Total Donations, Rating, Remarks</span></p>
            <p className="font-semibold text-gray-600">Blood Group values: <span className="font-normal">O+, O-, A+, A-, B+, B-, AB+, AB-</span></p>
            <button
              type="button"
              onClick={downloadTemplate}
              className="mt-1 text-red-600 hover:underline font-medium"
            >
              Download template CSV
            </button>
          </div>

          {/* Drop zone — hidden once a result is shown */}
          {!result && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                pickFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[3px] border-2 border-dashed border-gray-400 py-10 transition-colors hover:border-red-500 hover:bg-red-50"
            >
              <Upload size={22} className="text-gray-400" />
              <p className="text-sm font-medium text-gray-600">
                Click to browse or drag &amp; drop
              </p>
              <p className="text-xs text-gray-400">.csv files only</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  pickFile(e.currentTarget.files?.[0]);
                  e.currentTarget.value = "";
                }}
              />
            </div>
          )}

          {/* Selected file */}
          {file && !result && (
            <div className="flex items-center gap-3 rounded-[3px] border border-gray-300 bg-gray-50 px-4 py-3">
              <FileText size={16} className="flex-shrink-0 text-red-500" />
              <p className="flex-1 truncate text-sm font-medium text-[#1a1a1a]">
                {file.name}
              </p>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  reset();
                }}
                className="flex-shrink-0 rounded-[3px] p-0.5 text-gray-400 hover:text-gray-700"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Upload error */}
          {isError && (
            <div className="flex items-start gap-2 rounded-[3px] border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-600">
              <X size={13} className="mt-0.5 flex-shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Import result summary */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-[3px] border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckCircle2 size={15} className="flex-shrink-0" />
                <span>
                  <strong>{result.inserted}</strong> donor{result.inserted !== 1 ? "s" : ""} imported successfully
                  {result.failed > 0 && (
                    <>, <strong>{result.failed}</strong> row{result.failed !== 1 ? "s" : ""} skipped</>
                  )}
                </span>
              </div>
              {result.errors.length > 0 && (
                <div className="max-h-36 overflow-y-auto rounded-[3px] border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600 space-y-1">
                  {result.errors.map((e, i) => (
                    <p key={i}>{e}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-400 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-[3px] border border-gray-400 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            {result ? "Close" : "Cancel"}
          </button>
          {!result && (
            <button
              type="button"
              onClick={() =>
                file &&
                mutate(file, {
                  onSuccess: (data) => {
                    setResult(data);
                    onSuccess(data);
                  },
                })
              }
              disabled={!file || isPending}
              className="flex items-center gap-2 rounded-[3px] border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPending ? (
                <>
                  <svg
                    className="h-3.5 w-3.5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      opacity="0.25"
                    />
                    <path
                      d="M22 12a10 10 0 01-10 10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  Importing…
                </>
              ) : (
                "Import"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
