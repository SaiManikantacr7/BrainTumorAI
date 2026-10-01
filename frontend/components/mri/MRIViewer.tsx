"use client";

import React, { useState, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Sliders,
  Layers,
  Crosshair,
  Sun,
  Eye,
  Activity,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { MRI_SVGS, CLINICAL_SAFETY } from "@/lib/demo-data";

export type ModalityType = "T1" | "T2" | "FLAIR" | "T1CE";
export type OverlayType = "none" | "segmentation" | "gradcam" | "shap" | "attention";

interface MRIViewerProps {
  initialModality?: ModalityType;
  initialOverlay?: OverlayType;
  showControls?: boolean;
  className?: string;
}

export function MRIViewer({
  initialModality = "T1CE",
  initialOverlay = "segmentation",
  showControls = true,
  className = "",
}: MRIViewerProps) {
  const [modality, setModality] = useState<ModalityType>(initialModality);
  const [activeOverlay, setActiveOverlay] = useState<OverlayType>(initialOverlay);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.75);
  const [currentSlice, setCurrentSlice] = useState<number>(14);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number } | null>(null);
  const [isCrosshairActive, setIsCrosshairActive] = useState<boolean>(true);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);

  const containerRef = useRef<HTMLDivElement>(null);

  // Pan interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);
      setCrosshairPos({ x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 4));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setBrightness(100);
    setContrast(100);
  };

  // Determine active background SVG
  const getModalitySVG = () => {
    switch (modality) {
      case "T1": return MRI_SVGS.T1;
      case "T2": return MRI_SVGS.T2;
      case "FLAIR": return MRI_SVGS.FLAIR;
      case "T1CE": return MRI_SVGS.T1CE;
    }
  };

  // Determine active overlay SVG
  const getOverlaySVG = () => {
    switch (activeOverlay) {
      case "segmentation": return MRI_SVGS.SEGMENTATION;
      case "gradcam": return MRI_SVGS.GRADCAM;
      case "shap": return MRI_SVGS.SHAP;
      case "attention": return MRI_SVGS.ATTENTION;
      default: return null;
    }
  };

  return (
    <div className={`flex flex-col bg-navy-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl ${className}`}>
      {/* Top Bar: Modality Selector & Viewer Mode */}
      <div className="bg-navy-900/90 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Modalities */}
        <div className="flex items-center gap-1 bg-navy-950 p-1 rounded-lg border border-slate-800">
          {(["T1", "T2", "FLAIR", "T1CE"] as ModalityType[]).map((m) => (
            <button
              key={m}
              onClick={() => setModality(m)}
              className={`px-3 py-1 text-xs font-mono font-bold rounded transition-all ${
                modality === m
                  ? "bg-primary text-white shadow-glow-blue"
                  : "text-slate-400 hover:text-white hover:bg-navy-800"
              }`}
            >
              {m === "T1CE" ? "T1-CE" : m}
            </button>
          ))}
        </div>

        {/* Overlays */}
        <div className="flex items-center gap-1 bg-navy-950 p-1 rounded-lg border border-slate-800 overflow-x-auto">
          {[
            { id: "none", label: "Original" },
            { id: "segmentation", label: "Segmentation Mask" },
            { id: "gradcam", label: "Grad-CAM" },
            { id: "shap", label: "SHAP" },
            { id: "attention", label: "Cross-Attention" },
          ].map((ov) => (
            <button
              key={ov.id}
              onClick={() => setActiveOverlay(ov.id as OverlayType)}
              className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap transition-all ${
                activeOverlay === ov.id
                  ? "bg-purple-accent text-white shadow-glow-purple"
                  : "text-slate-400 hover:text-slate-200 hover:bg-navy-800"
              }`}
            >
              {ov.label}
            </button>
          ))}
        </div>

        {/* View Tools */}
        <div className="flex items-center gap-1 text-slate-300">
          <button onClick={handleZoomIn} title="Zoom In" className="p-1.5 hover:bg-navy-800 rounded">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={handleZoomOut} title="Zoom Out" className="p-1.5 hover:bg-navy-800 rounded">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={handleReset} title="Reset View" className="p-1.5 hover:bg-navy-800 rounded">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCrosshairActive(!isCrosshairActive)}
            title="Toggle Crosshairs"
            className={`p-1.5 rounded ${isCrosshairActive ? "bg-primary/20 text-primary" : "hover:bg-navy-800"}`}
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Medical Canvas Display */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative h-[480px] bg-[#03060c] cursor-crosshair overflow-hidden select-none medical-grid flex items-center justify-center"
      >
        {/* Transform container for Zoom and Pan */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            filter: `brightness(${brightness}%) contrast(${contrast}%)`,
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
          className="relative w-[400px] h-[400px] rounded shadow-2xl"
        >
          {/* Base MRI Modality Slice */}
          <img
            src={getModalitySVG()}
            alt={`Brain MRI ${modality} slice ${currentSlice}`}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />

          {/* AI Overlay Layer */}
          {getOverlaySVG() && (
            <img
              src={getOverlaySVG()!}
              alt="AI Overlay"
              style={{ opacity: overlayOpacity }}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none mix-blend-screen"
            />
          )}
        </div>

        {/* Medical Crosshair Overlay */}
        {isCrosshairActive && crosshairPos && (
          <div className="absolute inset-0 pointer-events-none">
            <div
              style={{ top: `${crosshairPos.y}px` }}
              className="absolute left-0 right-0 h-[1px] bg-cyan/40 border-t border-dashed border-cyan/60"
            />
            <div
              style={{ left: `${crosshairPos.x}px` }}
              className="absolute top-0 bottom-0 w-[1px] bg-cyan/40 border-l border-dashed border-cyan/60"
            />
          </div>
        )}

        {/* Voxel & Coordinate Telemetry Overlay */}
        <div className="absolute bottom-3 left-3 bg-navy-950/85 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded font-mono text-[11px] text-slate-300 pointer-events-none flex items-center gap-4">
          <div>
            <span className="text-slate-500">POS: </span>
            <span className="text-cyan font-bold">{crosshairPos ? `X:${crosshairPos.x} Y:${crosshairPos.y}` : "X:265 Y:165"}</span>
          </div>
          <div>
            <span className="text-slate-500">VOXEL: </span>
            <span className="text-primary font-bold">142.6 HU</span>
          </div>
          <div>
            <span className="text-slate-500">ZOOM: </span>
            <span className="text-white">{Math.round(zoom * 100)}%</span>
          </div>
        </div>

        {/* Anatomical Orientation Markers */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-mono font-bold text-slate-500 pointer-events-none">A (Anterior)</div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-mono font-bold text-slate-500 pointer-events-none">P (Posterior)</div>
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-500 pointer-events-none">R</div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-500 pointer-events-none">L</div>

        {/* Overlay Key Legend Badge */}
        {activeOverlay !== "none" && (
          <div className="absolute top-3 right-3 bg-navy-900/90 border border-slate-800 px-3 py-1.5 rounded text-xs pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-accent animate-ping" />
              <span className="font-semibold text-purple-300 capitalize">{activeOverlay} Active</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Opacity: {Math.round(overlayOpacity * 100)}%</div>
          </div>
        )}
      </div>

      {/* Bottom Control Bar: Slice Slider & Opacity */}
      {showControls && (
        <div className="bg-navy-900 border-t border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Slice Selector */}
          <div className="flex items-center gap-3 min-w-[240px] flex-1">
            <span className="text-xs font-mono text-slate-400 whitespace-nowrap">SLICE: <strong className="text-primary">{currentSlice}</strong> / 24</span>
            <input
              type="range"
              min="1"
              max="24"
              value={currentSlice}
              onChange={(e) => setCurrentSlice(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-navy-950 rounded-lg cursor-pointer"
            />
          </div>

          {/* Opacity Slider */}
          {activeOverlay !== "none" && (
            <div className="flex items-center gap-3 min-w-[200px]">
              <span className="text-xs font-mono text-slate-400 whitespace-nowrap">OVERLAY OPACITY:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(overlayOpacity * 100)}
                onChange={(e) => setOverlayOpacity(Number(e.target.value) / 100)}
                className="w-24 accent-purple-accent h-1.5 bg-navy-950 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-mono text-purple-300 w-8">{Math.round(overlayOpacity * 100)}%</span>
            </div>
          )}

          {/* Window / Level (Brightness & Contrast) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>WL:</span>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-16 accent-amber-400 h-1.5 bg-navy-950 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

