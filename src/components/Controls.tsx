import type { CSSProperties } from "react";
import { PRESETS, SWATCHES, type Preset } from "../lib/brand";
import { DOT_STYLES, type DotsType, type QrSettings } from "../lib/qr";

type Props = {
  settings: QrSettings;
  onChange: (next: QrSettings) => void;
  onDownload: (extension: "png" | "svg") => void;
};

function eq(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}

function isActive(s: QrSettings, p: Preset): boolean {
  if (s.transparentBg) return false;
  if (!eq(s.bgColor, p.bgColor)) return false;
  if (p.gradient) {
    return !!s.gradient && eq(s.gradient.from, p.gradient.from) && eq(s.gradient.to, p.gradient.to);
  }
  return !s.gradient && eq(s.dotsColor, p.dotsColor);
}

// Aperçu coloré d'un preset (fond + modules ou dégradé).
function presetSwatchStyle(p: Preset) {
  const dots = p.gradient
    ? `linear-gradient(135deg, ${p.gradient.from}, ${p.gradient.to})`
    : p.dotsColor;
  return { background: p.bgColor, "--dots": dots } as CSSProperties;
}

export default function Controls({ settings, onChange, onDownload }: Props) {
  const disabled = settings.url.trim() === "";

  const applyPreset = (p: Preset) =>
    onChange({
      ...settings,
      dotsColor: p.dotsColor,
      bgColor: p.bgColor,
      gradient: p.gradient,
      transparentBg: false,
    });

  return (
    <div className="controls">
      <label className="field">
        <span>URL</span>
        <input
          type="url"
          inputMode="url"
          placeholder="https://exemple.fr"
          value={settings.url}
          onChange={(e) => onChange({ ...settings, url: e.target.value })}
        />
      </label>

      <div className="field">
        <span>Presets charte Debout!</span>
        <div className="presets">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              className={`preset${isActive(settings, p) ? " preset--active" : ""}`}
              onClick={() => applyPreset(p)}
              title={p.name}
            >
              <span className="preset__swatch" style={presetSwatchStyle(p)}>
                <span className="preset__dots" />
              </span>
              <span className="preset__name">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="row">
        <label className="field">
          <span>Modules</span>
          <input
            type="color"
            value={settings.dotsColor}
            onChange={(e) => onChange({ ...settings, dotsColor: e.target.value, gradient: null })}
          />
        </label>
        <label className="field">
          <span>Fond</span>
          <input
            type="color"
            value={settings.bgColor}
            disabled={settings.transparentBg}
            onChange={(e) => onChange({ ...settings, bgColor: e.target.value })}
          />
        </label>
      </div>

      <label className="toggle">
        <input
          type="checkbox"
          checked={settings.transparentBg}
          onChange={(e) => onChange({ ...settings, transparentBg: e.target.checked })}
        />
        <span>Fond transparent</span>
      </label>

      <div className="field">
        <span>Palette</span>
        <div className="swatches">
          {SWATCHES.map((c) => (
            <button
              key={c.name}
              type="button"
              className="swatch"
              style={{ background: c.value }}
              title={`Modules : ${c.name}`}
              onClick={() => onChange({ ...settings, dotsColor: c.value, gradient: null })}
            />
          ))}
        </div>
      </div>

      <label className="field">
        <span>Forme des modules</span>
        <select
          className="select"
          value={settings.dotsType}
          onChange={(e) => onChange({ ...settings, dotsType: e.target.value as DotsType })}
        >
          {DOT_STYLES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Taille ({settings.size} px)</span>
        <input
          type="range"
          min={128}
          max={1024}
          step={32}
          value={settings.size}
          onChange={(e) => onChange({ ...settings, size: Number(e.target.value) })}
        />
      </label>

      <div className="actions">
        <button type="button" disabled={disabled} onClick={() => onDownload("png")}>
          Télécharger PNG
        </button>
        <button type="button" disabled={disabled} onClick={() => onDownload("svg")}>
          Télécharger SVG
        </button>
      </div>
    </div>
  );
}
