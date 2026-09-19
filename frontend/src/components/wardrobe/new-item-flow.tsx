"use client";

import Link from "next/link";
import { AnimatePresence } from "motion/react";
import { Container } from "@/components/container";
import { AnalyzingStage } from "@/components/wardrobe/analyzing-stage";
import { CompleteStage } from "@/components/wardrobe/complete-stage";
import { DetailsStage } from "@/components/wardrobe/details-stage";
import { FlowProgress } from "@/components/wardrobe/flow-progress";
import { PreferencesStage } from "@/components/wardrobe/preferences-stage";
import { PreviewStage } from "@/components/wardrobe/preview-stage";
import { UploadStage } from "@/components/wardrobe/upload-stage";
import { useNewGarmentFlow } from "@/hooks/use-new-garment-flow";

export function NewItemFlow() {
  const flow = useNewGarmentFlow();

  return (
    <div className="min-h-svh pb-24">
      <header className="border-b border-stone bg-ivory">
        <Container className="flex h-16 items-center justify-between lg:h-[4.75rem]">
          <Link
            href="/"
            className="label text-olive motion-safe:hover:-translate-y-px transition-all duration-500"
            aria-label="REWEAR home"
          >
            REWEAR
          </Link>
          <Link
            href="/wardrobe"
            className="label text-olive/70 hover:text-olive transition-colors duration-500"
          >
            Close
          </Link>
        </Container>
      </header>

      <Container className="pt-10 lg:pt-14">
        <FlowProgress step={flow.step} />

        <div className="mt-12 lg:mt-16">
          <AnimatePresence mode="wait">
            {flow.step === "upload" ? (
              <UploadStage
                key="upload"
                error={flow.error}
                onSelect={flow.selectFile}
              />
            ) : null}

            {flow.step === "preview" && flow.previewUrl ? (
              <PreviewStage
                key="preview"
                previewUrl={flow.previewUrl}
                error={flow.error}
                onSelect={flow.selectFile}
                onRemove={flow.removeFile}
                onAnalyze={() => {
                  void flow.analyzePiece();
                }}
              />
            ) : null}

            {flow.step === "analyzing" ? (
              <AnalyzingStage
                key="analyzing"
                progress={flow.progress}
                previewUrl={flow.previewUrl}
              />
            ) : null}

            {flow.step === "details" &&
            flow.analysis &&
            flow.previewUrl ? (
              <DetailsStage
                key="details"
                previewUrl={flow.previewUrl}
                analysis={flow.analysis}
                onChange={flow.updateAnalysisField}
                onStartOver={flow.startOver}
                saving={flow.saving}
                error={flow.error}
                onConfirm={() => {
                  void flow.confirmDetails();
                }}
              />
            ) : null}

            {flow.step === "preferences" ? (
              <PreferencesStage
                key="preferences"
                preferences={flow.preferences}
                error={flow.error}
                canContinue={flow.canContinue}
                onToggleOccasion={flow.toggleOccasion}
                onWeather={flow.setWeather}
                onStyle={flow.setStyleDirection}
                onContinue={flow.complete}
              />
            ) : null}

            {flow.step === "complete" && flow.analysis ? (
              <CompleteStage
                key="complete"
                previewUrl={flow.previewUrl}
                analysis={flow.analysis}
                preferences={flow.preferences}
              />
            ) : null}
          </AnimatePresence>
        </div>
      </Container>
    </div>
  );
}
