"use client";

import { useRef } from "react";
import Image from "next/image";
import { X, Plus } from "lucide-react";

interface ImageUploadProps {
  multiple?: boolean;
  disabled?: boolean;
  value: string[]; // blob or permanent URLs
  onChange: (urls: string[]) => void; // bubble URLs upward
}

export default function ImageUpload({
  multiple = true,
  disabled = false,
  value,
  onChange,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (fileList: FileList | null) => {
    if (!fileList) return;
    const selectedFiles = Array.from(fileList);

    // Create blob URLs for newly selected files
    const blobUrls = selectedFiles.map((file) => URL.createObjectURL(file));

    // Merge with existing value if multiple
    const newValue = multiple ? [...value, ...blobUrls] : [blobUrls[0]];
    onChange(newValue);
  };

  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  return (
    <div className="flex flex-wrap gap-3">
      {value.map((url, i) => (
        <div
          key={url + i} // avoid key collision for multiple blobs
          className="relative w-24 h-24 rounded-md overflow-hidden border"
        >
          <Image src={url} alt="upload" fill className="object-cover" />
          <button
            type="button"
            onClick={() => handleRemove(i)}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
        className="w-24 h-24 border-2 border-dashed flex items-center justify-center rounded-md"
      >
        <Plus className="w-6 h-6 text-gray-500" />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleSelect(e.target.files)}
      />
    </div>
  );
}
