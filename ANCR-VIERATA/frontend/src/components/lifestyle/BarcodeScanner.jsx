import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, BrowserCodeReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { X, Camera, Keyboard, Loader2, ImageOff, ScanLine, CheckCircle2, AlertTriangle, Clock3, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

const SUPPORTED = [
  BarcodeFormat.EAN_13, BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A, BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_128, BarcodeFormat.ITF,
];

const MEAL_TYPES = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
  { key: "snack", label: "Snack" },
  { key: "pre_performance", label: "Pre-performance" },
  { key: "post_performance", label: "Post-performance" },
  { key: "studio", label: "Studio / rehearsal" },
  { key: "beverage", label: "Beverage" },
];

function scaleFood(food, grams) {
  const f = grams / 100;
  return {
    food_id: food.id,
    name: food.name,
    grams,
    kcal: Math.round((food.kcal || 0) * f * 10) / 10,
    protein: Math.round((food.protein || 0) * f * 10) / 10,
    carbs: Math.round((food.carbs || 0) * f * 10) / 10,
    fat: Math.round((food.fat || 0) * f * 10) / 10,
    fiber: Math.round((food.fiber || 0) * f * 10) / 10,
  };
}

export default function BarcodeScanner({ open, onClose, onLogged }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const [mode, setMode] = useState("camera"); // "camera" | "manual"
  const [starting, setStarting] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [manual, setManual] = useState("");
  const [product, setProduct] = useState(null); // scan response
  const [looking, setLooking] = useState(false);
  const [grams, setGrams] = useState(100);
  const [mealType, setMealType] = useState("snack");
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState("");
  const [recent, setRecent] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const stop = () => {
    try { controlsRef.current?.stop(); } catch {}
    controlsRef.current = null;
  };

  const reset = () => {
    setProduct(null);
    setNotFound("");
    setGrams(100);
    setManual("");
    setMealType("snack");
  };

  const loadRecent = async () => {
    setLoadingRecent(true);
    try {
      const { data } = await api.get("/lifestyle/nutrition/scans/recent?limit=8");
      setRecent(data.items || []);
    } catch {
      setRecent([]);
    } finally {
      setLoadingRecent(false);
    }
  };

  const removeRecent = async (barcode, e) => {
    e?.stopPropagation?.();
    try {
      await api.delete(`/lifestyle/nutrition/scans/${encodeURIComponent(barcode)}`);
      setRecent((prev) => prev.filter((r) => r.barcode !== barcode));
    } catch {
      toast.error("Couldn't remove from history");
    }
  };

  const pickRecent = (item) => {
    setProduct({
      barcode: item.barcode,
      found: true,
      food: item.food,
      suggested_grams: item.suggested_grams,
      brand: item.brand,
      image_url: item.image_url,
      source: "history",
    });
    setGrams(item.suggested_grams || 100);
    setNotFound("");
  };

  // Load history when the modal opens
  useEffect(() => {
    if (open) loadRecent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Start / stop camera whenever the dialog opens or mode changes to camera
  useEffect(() => {
    if (!open) { stop(); reset(); return; }
    if (mode !== "camera") { stop(); return; }
    if (product) { stop(); return; } // don't scan while showing product

    let cancelled = false;
    (async () => {
      setStarting(true);
      setCameraError("");
      try {
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, SUPPORTED);
        hints.set(DecodeHintType.TRY_HARDER, true);
        const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 200 });
        // Prefer rear camera on mobile
        const devices = await BrowserCodeReader.listVideoInputDevices();
        const rear = devices.find((d) => /back|rear|environment/i.test(d.label));
        const deviceId = rear?.deviceId || devices[0]?.deviceId;
        if (!deviceId) throw new Error("No camera detected on this device");

        const controls = await reader.decodeFromVideoDevice(
          deviceId,
          videoRef.current,
          (result, _err, ctrl) => {
            if (cancelled) return;
            if (result) {
              const code = result.getText();
              ctrl.stop();
              controlsRef.current = null;
              lookup(code);
            }
          }
        );
        if (cancelled) { controls.stop(); return; }
        controlsRef.current = controls;
      } catch (e) {
        const msg = e?.name === "NotAllowedError"
          ? "Camera permission was blocked. Allow access or enter the barcode manually."
          : (e?.message || "Couldn't start the camera. Enter the barcode manually.");
        setCameraError(msg);
      } finally {
        setStarting(false);
      }
    })();

    return () => { cancelled = true; stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, product]);

  const lookup = async (code) => {
    setNotFound("");
    setLooking(true);
    try {
      const { data } = await api.get(`/lifestyle/nutrition/scan/${encodeURIComponent(code)}`);
      setProduct(data);
      setGrams(data.suggested_grams || 100);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 404) {
        setNotFound(e.response.data?.detail || "We couldn't find this item.");
      } else if (status === 400) {
        setNotFound("That doesn't look like a valid barcode. Try again.");
      } else {
        setNotFound("Food database is unavailable right now. Please try again in a moment.");
      }
    } finally {
      setLooking(false);
    }
  };

  const submitManual = (e) => {
    e?.preventDefault?.();
    const code = manual.trim().replace(/\s+/g, "");
    if (!code) return;
    lookup(code);
  };

  const logMeal = async () => {
    if (!product) return;
    const g = Math.max(1, Math.min(2000, Math.round(Number(grams) || 0)));
    const item = scaleFood(product.food, g);
    setSaving(true);
    try {
      await api.post("/lifestyle/meals", {
        date: new Date().toISOString().slice(0, 10),
        meal_type: mealType,
        items: [item],
        note: `Scanned · ${product.barcode}`,
      });
      toast.success(`Logged ${product.food.name.slice(0, 40)}`);
      onLogged?.();
      loadRecent();
      onClose?.();
    } catch {
      toast.error("Couldn't log this item. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const preview = product ? scaleFood(product.food, Math.max(1, Number(grams) || 0)) : null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      data-testid="barcode-scanner"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg glass rounded-3xl border border-white/10 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full blur-3xl opacity-30" style={{ background: "#14B8A6" }} />

        <div className="relative p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-viearta-teal mb-1">
                <ScanLine className="w-3.5 h-3.5 inline mr-1.5" /> Scan a barcode
              </div>
              <h3 className="font-display text-2xl tracking-tight">Log a packaged food</h3>
              <p className="text-white/55 text-xs mt-1">Uses Open Food Facts. Estimates only — check the label for accuracy.</p>
            </div>
            <button onClick={onClose} data-testid="barcode-close" className="text-white/60 hover:text-white" aria-label="Close scanner">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!product && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => { setMode("camera"); setNotFound(""); }} data-testid="barcode-mode-camera"
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs border ${mode === "camera" ? "bg-white text-black border-white" : "border-white/15 text-white/70 hover:border-white/30"}`}>
                  <Camera className="w-3.5 h-3.5" /> Camera
                </button>
                <button onClick={() => { setMode("manual"); setCameraError(""); }} data-testid="barcode-mode-manual"
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs border ${mode === "manual" ? "bg-white text-black border-white" : "border-white/15 text-white/70 hover:border-white/30"}`}>
                  <Keyboard className="w-3.5 h-3.5" /> Enter code
                </button>
              </div>

              {recent.length > 0 && (
                <div className="mb-4" data-testid="barcode-recent-section">
                  <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-white/45 mb-2">
                    <Clock3 className="w-3 h-3" /> Recent scans · tap to re-log
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" data-testid="barcode-recent-list">
                    {recent.map((item) => (
                      <button
                        key={item.barcode}
                        onClick={() => pickRecent(item)}
                        data-testid={`barcode-recent-${item.barcode}`}
                        title={item.food?.name}
                        className="group relative shrink-0 w-32 text-left rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/25 p-2 transition"
                      >
                        <div className="w-full aspect-square rounded-xl border border-white/10 bg-black/40 overflow-hidden flex items-center justify-center">
                          {item.image_url ? (
                            <img src={item.image_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                          ) : (
                            <ImageOff className="w-4 h-4 text-white/30" />
                          )}
                        </div>
                        <div className="text-[11px] text-white/85 mt-1.5 leading-tight line-clamp-2">{item.food?.name || item.barcode}</div>
                        <div className="text-[10px] text-white/40 mt-0.5">{Math.round(item.food?.kcal || 0)} kcal / 100g</div>
                        <span
                          role="button"
                          tabIndex={0}
                          aria-label="Remove from history"
                          onClick={(e) => removeRecent(item.barcode, e)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") removeRecent(item.barcode, e); }}
                          data-testid={`barcode-recent-remove-${item.barcode}`}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 focus:opacity-100 rounded-full p-1 bg-black/70 border border-white/15 hover:border-white/40 text-white/70 hover:text-white cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mode === "camera" && (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black aspect-[4/3]" data-testid="barcode-video-wrap">
                  <video ref={videoRef} className="w-full h-full object-cover" muted playsInline autoPlay />
                  {starting && (
                    <div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm gap-2 bg-black/40" data-testid="barcode-camera-loading">
                      <Loader2 className="w-4 h-4 animate-spin" /> Starting camera…
                    </div>
                  )}
                  {!starting && !cameraError && (
                    <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-16 border-y-2 border-emerald-300/60 pointer-events-none" />
                  )}
                  {cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-2" data-testid="barcode-camera-error">
                      <ImageOff className="w-6 h-6 text-white/50" />
                      <div className="text-sm text-white/70">{cameraError}</div>
                      <button onClick={() => setMode("manual")} className="mt-2 rounded-full px-4 py-1.5 text-xs border border-white/20 hover:border-white/40" data-testid="barcode-switch-manual">
                        Enter code instead
                      </button>
                    </div>
                  )}
                </div>
              )}

              {mode === "manual" && (
                <form onSubmit={submitManual} className="space-y-3" data-testid="barcode-manual-form">
                  <label className="text-xs text-white/60">Type or paste the barcode digits</label>
                  <div className="flex items-center gap-2">
                    <input
                      value={manual}
                      onChange={(e) => setManual(e.target.value.replace(/[^0-9]/g, "").slice(0, 14))}
                      placeholder="e.g. 3017620422003"
                      inputMode="numeric"
                      autoFocus
                      data-testid="barcode-manual-input"
                      className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-3 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-white/25"
                    />
                    <button type="submit" disabled={looking || manual.length < 6} data-testid="barcode-manual-submit"
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm bg-white text-black hover:bg-white/90 disabled:opacity-50">
                      {looking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Look up"}
                    </button>
                  </div>
                  <p className="text-[11px] text-white/40">EAN-13, EAN-8, UPC-A/E, ITF are supported (6–14 digits).</p>
                </form>
              )}

              {looking && mode !== "manual" && (
                <div className="mt-4 text-sm text-white/60 inline-flex items-center gap-2" data-testid="barcode-looking">
                  <Loader2 className="w-4 h-4 animate-spin" /> Looking up product…
                </div>
              )}

              {notFound && (
                <div className="mt-4 rounded-2xl border border-amber-300/25 bg-amber-500/10 text-amber-50/95 text-sm p-3 flex items-start gap-2" data-testid="barcode-not-found">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div>{notFound}</div>
                    <button onClick={() => { setNotFound(""); setManual(""); setMode(mode); }} className="mt-1 text-xs underline hover:text-white" data-testid="barcode-try-again">
                      Try another barcode
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {product && (
            <div className="space-y-4" data-testid="barcode-product">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                {product.image_url ? (
                  <img src={product.image_url} alt="" className="w-16 h-16 rounded-xl object-cover border border-white/10" />
                ) : (
                  <div className="w-16 h-16 rounded-xl border border-white/10 flex items-center justify-center text-white/40">
                    <ImageOff className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-white/90 truncate" data-testid="barcode-product-name">{product.food.name}</div>
                  <div className="text-[11px] text-white/45 mt-0.5">Barcode {product.barcode} · via Open Food Facts</div>
                  <div className="text-[11px] text-white/60 mt-1">
                    per 100 g · {product.food.kcal} kcal · P {product.food.protein}g · C {product.food.carbs}g · F {product.food.fat}g
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-white/45">Serving (g)</label>
                  <input
                    type="number" min={1} max={2000} step={1}
                    value={grams}
                    onChange={(e) => setGrams(e.target.value)}
                    data-testid="barcode-grams"
                    className="mt-1 w-full bg-white/[0.03] border border-white/10 rounded-2xl px-3 py-2 text-sm outline-none focus:border-white/25"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-white/45">Meal</label>
                  <select value={mealType} onChange={(e) => setMealType(e.target.value)} data-testid="barcode-meal-type"
                    className="mt-1 w-full bg-white/[0.03] border border-white/10 rounded-2xl px-3 py-2 text-sm outline-none focus:border-white/25">
                    {MEAL_TYPES.map((t) => <option key={t.key} value={t.key} className="bg-black">{t.label}</option>)}
                  </select>
                </div>
              </div>

              {preview && (
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3 text-xs text-white/70 flex items-center gap-2" data-testid="barcode-preview">
                  <CheckCircle2 className="w-4 h-4 text-viearta-teal" />
                  <div>
                    Adds <span className="text-white">{preview.kcal} kcal</span> · P {preview.protein}g · C {preview.carbs}g · F {preview.fat}g · Fiber {preview.fiber}g
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <button onClick={reset} data-testid="barcode-scan-again" className="text-xs text-white/60 hover:text-white">
                  Scan another
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={onClose} data-testid="barcode-cancel" className="rounded-full px-4 py-2 text-sm border border-white/15 hover:border-white/30">Cancel</button>
                  <button onClick={logMeal} disabled={saving || !grams} data-testid="barcode-add"
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm bg-white text-black hover:bg-white/90 disabled:opacity-60">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Add to today
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
