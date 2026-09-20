"use client";
import React, { Suspense } from "react";
import ImageAnalyzerView from "@/components/ImageAnalyzerView";

export default function PlantHealthPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
      <ImageAnalyzerView type="plant" />
    </Suspense>
  );
}
