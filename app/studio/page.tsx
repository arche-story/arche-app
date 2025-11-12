"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { PromptEditor } from "@/app/studio/(components)/prompt-editor";
import { AIOutputPanel } from "@/app/studio/(components)/ai-output-panel";

export default function StudioPage() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState<string | null>(null);

  function handleGenerate() {
    // TODO: Swap this mock with a call to the generation endpoint.
    setOutput(
      prompt
        ? `Generated piece based on: ${prompt}`
        : "Generated piece based on an empty prompt.",
    );
  }

  function handleSave() {
    // TODO: Persist the version to local storage or an API.
    console.info("Save stroke clicked");
  }

  function handleRegister() {
    // TODO: Call Story Protocol SDK endpoint.
    console.info("Sign on Story clicked");
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pt-14 pb-10">
        <div className="grid gap-6 md:grid-cols-2">
          <PromptEditor
            value={prompt}
            onChange={setPrompt}
            onGenerate={handleGenerate}
          />
          <AIOutputPanel
            output={output}
            onSave={handleSave}
            onRegister={handleRegister}
          />
        </div>
      </main>
    </>
  );
}
