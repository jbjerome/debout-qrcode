import { useState, type CSSProperties } from "react";
import { PRESETS, SWATCHES, type Preset } from "../lib/brand";
import { ICONS, type IconKey } from "../lib/icons";
import {
  CORNER_STYLES,
  DOT_STYLES,
  type CornerStyle,
  type DotsType,
  type QrSettings,
} from "../lib/qr";
import ColorInput from "./ColorInput";

type Props = {
  settings: QrSettings;
  onChange: (next: QrSettings) => void;
  onDownload: (extension: "png" | "svg") => void;
};

type Tab = "code" | "fond" | "icone";

const TABS: { id: Tab; label: string }[] = [
  { id: "code", label: "Code" },
  { id: "fond", label: "Fond" },
  { id: "icone", label: "Icône" },
];

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
  const [tab, setTab] = useState<Tab>("code");
  const disabled = settings.url.trim() === "";
  const noIcon = settings.icon === "none";

  const applyPreset = (p: Preset) =>
    onChange({
      ...settings,
      dotsColor: p.dotsColor,
      cornerColor: p.gradient ? p.gradient.from : p.dotsColor,
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

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`tab${tab === t.id ? " tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "code" && (
        <div className="tab-panel">
          <div className="field">
            <span>Couleur des modules</span>
            <ColorInput
              value={settings.dotsColor}
              onChange={(hex) => onChange({ ...settings, dotsColor: hex, gradient: null })}
            />
          </div>

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
            <span>Forme des coins</span>
            <select
              className="select"
              value={settings.cornerStyle}
              onChange={(e) => onChange({ ...settings, cornerStyle: e.target.value as CornerStyle })}
            >
              {CORNER_STYLES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <div className="field">
            <span>Couleur des coins</span>
            <ColorInput
              value={settings.cornerColor}
              onChange={(hex) => onChange({ ...settings, cornerColor: hex })}
            />
          </div>

          <div className="field">
            <span>Palette des coins</span>
            <div className="swatches">
              {SWATCHES.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  className="swatch"
                  style={{ background: c.value }}
                  title={`Coins : ${c.name}`}
                  onClick={() => onChange({ ...settings, cornerColor: c.value })}
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
        </div>
      )}

      {tab === "fond" && (
        <div className="tab-panel">
          <div className="field">
            <span>Couleur du fond</span>
            <ColorInput
              value={settings.bgColor}
              disabled={settings.transparentBg}
              onChange={(hex) => onChange({ ...settings, bgColor: hex })}
            />
          </div>

          <div className="field">
            <span>Palette</span>
            <div className="swatches">
              {SWATCHES.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  className="swatch"
                  style={{ background: c.value }}
                  disabled={settings.transparentBg}
                  title={`Fond : ${c.name}`}
                  onClick={() => onChange({ ...settings, bgColor: c.value })}
                />
              ))}
            </div>
          </div>

          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.transparentBg}
              onChange={(e) => onChange({ ...settings, transparentBg: e.target.checked })}
            />
            <span>Fond transparent</span>
          </label>
        </div>
      )}

      {tab === "icone" && (
        <div className="tab-panel">
          <label className="field">
            <span>Icône centrale</span>
            <select
              className="select"
              value={settings.icon}
              onChange={(e) => onChange({ ...settings, icon: e.target.value as IconKey })}
            >
              {ICONS.map((i) => (
                <option key={i.value} value={i.value}>
                  {i.label}
                </option>
              ))}
            </select>
          </label>

          <div className="field">
            <span>Couleur de l'icône</span>
            <ColorInput
              value={settings.iconColor}
              disabled={noIcon}
              onChange={(hex) => onChange({ ...settings, iconColor: hex })}
            />
          </div>

          <div className="field">
            <span>Palette</span>
            <div className="swatches">
              {SWATCHES.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  className="swatch"
                  style={{ background: c.value }}
                  disabled={noIcon}
                  title={`Icône : ${c.name}`}
                  onClick={() => onChange({ ...settings, iconColor: c.value })}
                />
              ))}
            </div>
          </div>
        </div>
      )}

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
