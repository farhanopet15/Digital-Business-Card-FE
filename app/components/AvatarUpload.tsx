"use client";
import { useRef, useState } from "react";

type AvatarUploadProps = {
  value?: string;
  onValueChange: (dataUrl?: string) => void;
};

export default function AvatarUpload({ value, onValueChange }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(value);
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="flex items-center gap-4">
      <div className="h-20 w-20 rounded-2xl overflow-hidden border border-black/10 bg-white/60 grid place-items-center text-sm text-black/50">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="avatar" className="h-full w-full object-cover" />
        ) : (
          "No Photo"
        )}
      </div>
      <div className="space-x-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              const dataUrl = typeof reader.result === "string" ? reader.result : undefined;
              setPreview(dataUrl);
              onValueChange(dataUrl);
            };
            reader.readAsDataURL(file);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm hover:bg-white dark:bg-white/10 dark:border-white/10 dark:text-white"
        >
          Upload
        </button>
        {preview && (
          <button
            type="button"
            onClick={() => {
              setPreview(undefined);
              onValueChange(undefined);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm hover:bg-white dark:bg-white/10 dark:border-white/10 dark:text-white"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}