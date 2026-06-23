import { useEffect, useState } from "react";

type Props = {
  value: string;
  disabled?: boolean;
  onChange: (hex: string) => void;
};

const HEX = /^#[0-9a-fA-F]{6}$/;

// Color picker + saisie hexadécimale synchronisés.
export default function ColorInput({ value, disabled, onChange }: Props) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);

  const handleText = (raw: string) => {
    setText(raw);
    const hex = raw.startsWith("#") ? raw : `#${raw}`;
    if (HEX.test(hex)) onChange(hex.toLowerCase());
  };

  return (
    <div className="color-input">
      <input
        type="color"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
      <input
        type="text"
        className="hex"
        value={text}
        disabled={disabled}
        spellCheck={false}
        maxLength={7}
        placeholder="#000000"
        onChange={(e) => handleText(e.target.value)}
        onBlur={() => setText(value)}
      />
    </div>
  );
}
