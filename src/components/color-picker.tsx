"use client";

import { useState } from "react";

const PRESETS = [
  "#c96a87", // blush rose (default)
  "#6fa8d6", // sky
  "#6fb88a", // sage
  "#e0a857", // gold
  "#b98aad", // lavender
  "#e88b6a", // coral
  "#5fb8b0", // teal
  "#8c8577", // stone
];

export function ColorPicker({ name, defaultValue }: { name: string; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue || PRESETS[0]);

  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((hex) => (
          <button
            key={hex}
            type="button"
            aria-label={hex}
            onClick={() => setValue(hex)}
            className="h-7 w-7 rounded-full ring-offset-2 ring-offset-raised transition-shadow"
            style={{
              background: hex,
              boxShadow: value === hex ? `0 0 0 2px ${hex}` : "none",
            }}
          />
        ))}
        <label
          className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-dashed border-border text-[10px] text-ink-soft"
          title="Custom color"
        >
          +
          <input
            type="color"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
      </div>
    </div>
  );
}
