"use client";

import { Bookmark, FileCode2, Link2, X } from "lucide-react";
import { use, useEffect, useMemo, useState } from "react";
import { browser } from "react-dom";
import { AboutDialog } from "./AboutDialog";
import { ExportDialog } from "./ExportDialog";
import { FontPicker } from "./FontPicker";
import { Nav } from "./Nav";
import { PresetBar } from "./PresetBar";
import { PresetGallery } from "./PresetGallery";
import { Preview } from "./Preview";
import { SaveDialog } from "./SaveDialog";
import { SavedDrawer } from "./SavedDrawer";
import { StylePanel } from "./StylePanel";
import { TextPanel } from "./TextPanel";
import { useToast } from "./ui/Toast";
import { useFontCatalog } from "@/hooks/useFontCatalog";
import { useFontStatus } from "@/hooks/useFontStatus";
import { useSavedCombinations } from "@/hooks/useSavedCombinations";
import { copyText } from "@/lib/clipboard";
import { readJson, STORAGE_KEYS, writeJson } from "@/lib/storage";
import {
  DEFAULT_TEXT,
  configsEqual,
  nearestWeight,
  sanitizeConfig,
  sanitizeText,
} from "@/lib/typography/config";
import { DEFAULT_CONFIG, PRESETS } from "@/lib/typography/presets";
import { SHARE_PARAM, decodeConfig, encodeConfig, shareUrl } from "@/lib/typography/share";
import type { FontFamily, Role, SampleText, TypeConfig, TypeStyle } from "@/lib/typography/types";

type Tab = Role | "text";
type DialogName = "picker" | "save" | "export" | "saved" | "about" | "gallery" | null;

const TABS: { id: Tab; label: string }[] = [
  { id: "heading", label: "Heading" },
  { id: "body", label: "Body" },
  { id: "text", label: "Text" },
];

/** Shared link wins, then the last session, then the default preset. */
function initialState(): { config: TypeConfig; text: SampleText } {
  const session = readJson(STORAGE_KEYS.session) as { config?: unknown; text?: unknown } | null;
  const fromUrl = decodeConfig(new URLSearchParams(window.location.search).get(SHARE_PARAM));
  const fromSession = session ? sanitizeConfig(session.config, DEFAULT_CONFIG) : null;
  return {
    config: fromUrl ?? fromSession ?? DEFAULT_CONFIG,
    text: session ? sanitizeText(session.text) : DEFAULT_TEXT,
  };
}

export function Playground() {
  // Everything below reads the URL and localStorage, so it renders in the browser only.
  use(browser("The playground restores state from the URL and localStorage."));

  const [initial] = useState(initialState);
  const [config, setConfig] = useState(initial.config);
  const [text, setText] = useState(initial.text);
  const [tab, setTab] = useState<Tab>("heading");
  const [pickerRole, setPickerRole] = useState<Role>("heading");
  const [dialog, setDialog] = useState<DialogName>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const notify = useToast();
  const catalog = useFontCatalog();
  const savedStore = useSavedCombinations();

  const headingFont = catalog.byFamily.get(config.heading.family);
  const bodyFont = catalog.byFamily.get(config.body.family);
  const subtitleWeight = nearestWeight(headingFont?.weights ?? [config.heading.weight], 400);
  const [headingStatus, subtitleStatus, bodyStatus] = useFontStatus([
    { family: config.heading.family, weight: config.heading.weight },
    { family: config.heading.family, weight: subtitleWeight },
    { family: config.body.family, weight: config.body.weight },
  ]);

  const activePreset = useMemo(() => PRESETS.find((p) => configsEqual(p.config, config)) ?? null, [config]);
  const pairingName = activePreset?.name ?? `${config.heading.family} and ${config.body.family}`;

  useEffect(() => {
    writeJson(STORAGE_KEYS.session, { config, text });
  }, [config, text]);

  // Keep the address bar shareable at all times.
  useEffect(() => {
    const id = setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.set(SHARE_PARAM, encodeConfig(config));
      window.history.replaceState(window.history.state, "", url);
    }, 250);
    return () => clearTimeout(id);
  }, [config]);

  const updateStyle = (role: Role, patch: Partial<TypeStyle>) =>
    setConfig((c) => ({ ...c, [role]: { ...c[role], ...patch } }));

  const chooseFamily = (role: Role, font: FontFamily) =>
    updateStyle(role, {
      family: font.family,
      category: font.category,
      weight: nearestWeight(font.weights, config[role].weight),
    });

  const openPicker = (role: Role) => {
    setPickerRole(role);
    setDialog("picker");
  };

  const share = async () => {
    const ok = await copyText(shareUrl(config, window.location.href));
    notify(ok ? "Link copied" : "Couldn’t copy. Copy the address bar instead.");
  };

  const loadCombination = (next: TypeConfig, name: string) => {
    setConfig(next);
    setDialog(null);
    notify(`Loaded ${name}`);
  };

  const panel =
    tab === "text" ? (
      <TextPanel
        text={text}
        onChange={(patch) => setText((t) => ({ ...t, ...patch }))}
        onReset={() => setText(DEFAULT_TEXT)}
        isDefault={JSON.stringify(text) === JSON.stringify(DEFAULT_TEXT)}
      />
    ) : (
      <StylePanel
        key={tab}
        role={tab}
        style={config[tab]}
        font={tab === "heading" ? headingFont : bodyFont}
        status={tab === "heading" ? headingStatus : bodyStatus}
        onChange={(patch) => updateStyle(tab, patch)}
        onOpenPicker={() => openPicker(tab)}
      />
    );

  return (
    <>
      <Nav
        savedCount={savedStore.saved.length}
        savedOpen={dialog === "saved"}
        onPlayground={() => {
          setDialog(null);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onSaved={() => setDialog("saved")}
        onAbout={() => setDialog("about")}
      />

      <main className={`mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-10 lg:pb-16 ${sheetOpen ? "max-lg:pb-[52dvh]" : "pb-32"}`}>
        <div className="flex items-center gap-3 pt-5 pb-2 sm:pt-6">
          <div className="min-w-0 flex-1">
            <PresetBar
              activeId={activePreset?.id ?? null}
              onSelect={(p) => setConfig(p.config)}
              onOpenGallery={() => setDialog("gallery")}
            />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <ToolbarButton label="Save" onClick={() => setDialog("save")} icon={<Bookmark size={16} strokeWidth={1.75} />} />
            <ToolbarButton label="Copy link" onClick={share} icon={<Link2 size={16} strokeWidth={1.75} />} />
            <ToolbarButton
              label="Export"
              primary
              onClick={() => setDialog("export")}
              icon={<FileCode2 size={16} strokeWidth={1.75} />}
            />
          </div>
        </div>
        <p className="mb-5 min-h-5 text-[13px] leading-5 text-ink-3 sm:mb-6" aria-live="polite">
          {activePreset ? activePreset.note : "Custom pairing. Choose a preset to start over."}
        </p>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Preview
            config={config}
            subtitleWeight={subtitleWeight}
            text={text}
            onTextChange={(patch) => setText((t) => ({ ...t, ...patch }))}
            status={{ heading: headingStatus, subtitle: subtitleStatus, body: bodyStatus }}
          />

          {/* Desktop: a sticky rail. Mobile: a bottom sheet over the preview. */}
          <aside
            aria-label="Typography controls"
            className={`max-lg:fixed max-lg:inset-x-0 max-lg:bottom-[60px] sm:max-lg:mx-auto sm:max-lg:max-w-[560px] sm:max-lg:rounded-2xl sm:max-lg:border max-lg:z-20 max-lg:max-h-[46dvh] max-lg:overflow-y-auto max-lg:overscroll-contain max-lg:rounded-t-2xl max-lg:border-t max-lg:border-line max-lg:bg-paper max-lg:px-5 max-lg:pt-4 max-lg:pb-6 max-lg:shadow-[0_-16px_40px_-24px_rgb(0_0_0/0.3)] max-lg:transition-[transform,visibility] max-lg:duration-300 max-lg:ease-[var(--ease-out-soft)] lg:sticky lg:top-[72px] lg:max-h-[calc(100dvh-88px)] lg:overflow-y-auto lg:pb-6 ${
              sheetOpen ? "" : "max-lg:invisible max-lg:translate-y-[calc(100%+60px)]"
            }`}
          >
            <div className="sticky top-0 z-10 -mx-5 -mt-4 mb-4 flex items-center justify-between bg-paper px-5 pt-3 pb-1 lg:hidden">
              <span className="text-[13px] font-medium text-ink">{TABS.find((t) => t.id === tab)?.label}</span>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Close controls"
                className="grid size-8 place-items-center rounded-full text-ink-3 hover:bg-hover hover:text-ink"
              >
                <X size={16} strokeWidth={1.75} />
              </button>
            </div>
            <div className="mb-6 max-lg:hidden">
              <TabList tab={tab} onChange={setTab} />
            </div>
            <div role="tabpanel" id="controls-panel" aria-label={TABS.find((t) => t.id === tab)?.label}>
              {panel}
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile tab bar that opens the controls sheet. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper px-4 py-3 lg:hidden">
        <div className="mx-auto max-w-[560px]">
        <TabList
          tab={sheetOpen ? tab : null}
          onChange={(t) => {
            if (sheetOpen && t === tab) setSheetOpen(false);
            else {
              setTab(t);
              setSheetOpen(true);
            }
          }}
        />
        </div>
      </div>

      <FontPicker
        open={dialog === "picker"}
        onClose={() => setDialog(null)}
        title={pickerRole === "heading" ? "Heading font" : "Body font"}
        fonts={catalog.fonts}
        source={catalog.source}
        value={config[pickerRole].family}
        onSelect={(font) => chooseFamily(pickerRole, font)}
      />
      <SaveDialog
        open={dialog === "save"}
        onClose={() => setDialog(null)}
        suggestedName={pairingName}
        onSave={(name) => {
          const entry = savedStore.save(name, config);
          setDialog(null);
          notify(`Saved ${entry.name}`, { label: "View", run: () => setDialog("saved") });
        }}
      />
      <ExportDialog open={dialog === "export"} onClose={() => setDialog(null)} config={config} name={pairingName} />
      <SavedDrawer
        open={dialog === "saved"}
        onClose={() => setDialog(null)}
        saved={savedStore.saved}
        persistFailed={savedStore.persistFailed}
        onLoad={(entry) => loadCombination(entry.config, entry.name)}
        onDelete={(entry) => savedStore.remove(entry.id)}
        onRestore={savedStore.restore}
      />
      <PresetGallery
        open={dialog === "gallery"}
        onClose={() => setDialog(null)}
        activeId={activePreset?.id ?? null}
        onSelect={(p) => setConfig(p.config)}
      />
      <AboutDialog open={dialog === "about"} onClose={() => setDialog(null)} />
    </>
  );
}

function TabList({ tab, onChange }: { tab: Tab | null; onChange: (t: Tab) => void }) {
  return (
    <div role="tablist" aria-label="Controls" className="flex rounded-lg bg-hover p-0.5">
      {TABS.map((t) => {
        const selected = t.id === tab;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls="controls-panel"
            onClick={() => onChange(t.id)}
            className={`h-8 flex-1 rounded-md text-[13px] transition-[background-color,color,box-shadow] duration-150 ${
              selected
                ? "bg-sheet font-medium text-ink shadow-[0_1px_2px_rgb(0_0_0/0.08),0_0_0_0.5px_rgb(0_0_0/0.06)]"
                : "text-ink-3 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function ToolbarButton({
  label,
  icon,
  onClick,
  primary,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-9 items-center gap-2 rounded-full text-[13px] transition-[background-color,color,transform] active:scale-[0.97] max-xl:w-9 max-xl:justify-center xl:px-4 ${
        primary ? "bg-ink font-medium text-white hover:bg-black" : "text-ink-2 hover:bg-hover hover:text-ink"
      }`}
    >
      {icon}
      <span className="max-xl:sr-only">{label}</span>
    </button>
  );
}
