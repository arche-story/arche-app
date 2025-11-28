"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation"; // Use useParams
import { SiteHeader } from "@/components/site-header";
import { PromptEditor } from "@/app/studio/(components)/prompt-editor";
import { AIOutputPanel } from "@/app/studio/(components)/ai-output-panel";
import { VersionHistory } from "@/components/studio/VersionHistory";
import { AssetConfig } from "@/components/studio/AssetConfig";
import { StudioDashboard } from "@/app/studio/(components)/studio-dashboard";
import { useProjectHistory } from "@/hooks/useProjectHistory";
import { useWallet } from "@/components/wrapper/WalletProvider";
import { LicenseParams } from "@/types/license";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

// Mock User for Hackathon Demo (Fallback)
const TEST_USER = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
const POLLINATIONS_API_BASE_URL = "https://image.pollinations.ai/prompt";

function StudioContent() {
  const searchParams = useSearchParams();
  const params = useParams(); // Get route params
  const routeId = params.slug ? params.slug[0] : null; // Handle optional catch-all

  // Fallback to query params for backwards compatibility during migration
  const draftPromptParam = searchParams.get("prompt");
  const remixIdParam = searchParams.get("remix");

  const { account, connectWallet } = useWallet();
  const router = useRouter();

  // View Mode Logic
  const [activeDraftId, setActiveDraftId] = useState<string | null>(routeId);
  const [isNewProject, setIsNewProject] = useState(routeId === "new");

  // Pass activeDraftId (or null) as contextId to the hook.
  // If 'new', pass 'new' to ensure hook returns empty history initially.
  // If null (Dashboard), pass null (fetch all recent).
  const { history, saveDraft, loading } = useProjectHistory(
    account || TEST_USER,
    activeDraftId
  );

  // State initialization
  useEffect(() => {
    if (routeId) {
      setActiveDraftId(routeId);
      setIsNewProject(routeId === "new");
      // If remix param exists on new project
      if (routeId === "new" && remixIdParam) {
        setParentIpId(remixIdParam);
      }
    } else {
      setActiveDraftId(null);
      setIsNewProject(false);
    }
  }, [routeId, remixIdParam]);

  // Editor State
  const [committedPrompt, setCommittedPrompt] = useState(
    draftPromptParam || ""
  );
  const [committedImageUrl, setCommittedImageUrl] = useState<string | null>(
    null
  );
  const [stagedPrompt, setStagedPrompt] = useState(draftPromptParam || "");
  const [stagedImageUrl, setStagedImageUrl] = useState<string | null>(null);
  const [output, setOutput] = useState<string | null>(null);

  const [licenseParams, setLicenseParams] = useState<LicenseParams>({
    type: "NON_COMMERCIAL",
    mintingFee: "0",
    commercialRevShare: 10,
  });
  const [parentIpId, setParentIpId] = useState(remixIdParam || "");

  const [isRegistering, setIsRegistering] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const isDirty =
    stagedPrompt !== committedPrompt || stagedImageUrl !== committedImageUrl;

  // Restore logic
  useEffect(() => {
    // Only restore if we are on a specific draft ID (not new, not dashboard) and history is loaded
    if (activeDraftId && activeDraftId !== "new" && history.length > 0) {
      // Try to find the CURRENT active draft in the history list
      // Note: Since get-history now returns lineage, the active draft SHOULD be in the list.
      // If it's not (e.g. just created and history refresh lag), we might need to handle it.

      // IMPORTANT: We want to restore the STATE of the editor to match the Active Draft ID
      // Only if we haven't loaded it yet.

      const activeDraft = history.find((h) => h.id === activeDraftId);

      if (activeDraft) {
        // Check if we need to load it (e.g. state is empty or doesn't match)
        // Simple check: is committedPrompt empty?
        if (committedPrompt === "" && committedImageUrl === null) {
          restoreVersion(activeDraft);
        }
      }
    } else if (draftPromptParam && isNewProject) {
      setStagedPrompt(draftPromptParam);
      setCommittedPrompt(draftPromptParam);
    }
  }, [activeDraftId, history, draftPromptParam, isNewProject]);

  const restoreVersion = (version: any) => {
    console.log("Restoring:", version);
    const promptText = version.prompt || "";
    let imgUrl = null;
    if (version.imageUri) {
      let uri = version.imageUri;
      if (uri.startsWith("ipfs://"))
        uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
      imgUrl = uri;
    }
    setStagedPrompt(promptText);
    setCommittedPrompt(promptText);
    setStagedImageUrl(imgUrl);
    setCommittedImageUrl(imgUrl);
    setOutput(`[Opened] ${version.label}`);
  };

  // --- Actions ---

  const handleDashboardSelect = (
    draftId: string,
    prompt: string,
    imageUrl?: string
  ) => {
    // Optimistic update
    setActiveDraftId(draftId);
    setStagedPrompt(prompt);
    setCommittedPrompt(prompt);
    let uri = imageUrl;
    if (uri?.startsWith("ipfs://"))
      uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
    setStagedImageUrl(uri || null);
    setCommittedImageUrl(uri || null);

    // Navigate to dynamic route
    router.push(`/studio/${draftId}`);
  };

  const handleNewProject = () => {
    handleReset();
    router.push(`/studio/new`);
  };

  const handleBackToDashboard = () => {
    if (isDirty) {
      if (
        !confirm("You have unsaved changes. Are you sure you want to go back?")
      )
        return;
    }
    handleReset();
    router.push(`/studio`);
  };

  const handleReset = useCallback(() => {
    setStagedPrompt("");
    setCommittedPrompt("");
    setStagedImageUrl(null);
    setCommittedImageUrl(null);
    setOutput(null);
    setParentIpId("");
  }, []);

  // --- Editor Logic ---

  const handleVersionSelect = useCallback(
    (versionId: string) => {
      const selectedVersion = history.find((v) => v.id === versionId);
      if (selectedVersion) {
        restoreVersion(selectedVersion);
        toast.info("Version restored");
        // If switching versions of the same project, we might just update state.
        // If history contains versions of DIFFERENT projects (global history), we should switch route.
        // Assuming global history for now:
        if (selectedVersion.id !== activeDraftId) {
          router.push(`/studio/${selectedVersion.id}`);
        }
      }
    },
    [history, activeDraftId, router]
  );

  // Handle image load completion from AIOutputPanel
  const handleImageLoad = useCallback(() => {
    if (isGenerating) {
      setIsGenerating(false);
      toast.success("Preview generated! Commit to save.");
    }
  }, [isGenerating]);

  async function handleGenerate() {
    if (!stagedPrompt) return;
    setIsGenerating(true); // Start loading
    setStagedImageUrl(null);
    setOutput("Generating image from prompt...");

    try {
      const encodedPrompt = encodeURIComponent(stagedPrompt);
      // Pollinations returns image directly. We set the URL.
      // Loading stops when <Image> calls handleImageLoad (onLoadingComplete)
      const imageUrl = `${POLLINATIONS_API_BASE_URL}/${encodedPrompt}`;

      setStagedImageUrl(imageUrl);
      setOutput(`Preview generated for: "${stagedPrompt}"`);

      // Note: We do NOT set isGenerating(false) here anymore.
      // We wait for the image to load.
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate image.");
      setIsGenerating(false); // Fail safe
    }
  }

  async function handleCommit() {
    if (!stagedImageUrl || !stagedPrompt) return;

    const commitPromise = new Promise(async (resolve, reject) => {
      try {
        // If activeDraftId is 'new', backend creates new.
        // If it's an ID, backend updates/versions it.
        // We pass undefined if 'new' to let backend generate ID,
        // OR we can generate ID here if we want optimistic routing.
        // Let's let backend handle it and return new ID.

        const targetId = activeDraftId === "new" ? undefined : activeDraftId;

        const newDraftId = await saveDraft(
          stagedPrompt,
          undefined,
          targetId || undefined,
          stagedImageUrl
        );
        if (newDraftId) {
          setCommittedPrompt(stagedPrompt);
          setCommittedImageUrl(stagedImageUrl);

          // If we were 'new', now we are 'draft_xyz'. Update URL.
          if (activeDraftId === "new" || activeDraftId !== newDraftId) {
            router.replace(`/studio/${newDraftId}`);
          }

          resolve(newDraftId);
        } else {
          reject(new Error("Failed to save draft"));
        }
      } catch (e) {
        reject(e);
      }
    });

    toast.promise(commitPromise, {
      loading: "Saving version history...",
      success: "Version committed successfully!",
      error: "Failed to commit version",
    });
  }

  function handleRevert() {
    setStagedPrompt(committedPrompt);
    setStagedImageUrl(committedImageUrl);
    toast.info("Changes reverted.");
  }

  async function handleRegister() {
    if (isDirty) {
      toast.warning("Please commit your changes before registering.");
      return;
    }
    if (!committedImageUrl || !committedPrompt) {
      toast.error("Please generate and commit an artwork first.");
      return;
    }
    if (!account) {
      toast.warning("Connect wallet to register IP");
      await connectWallet();
      return;
    }
    setIsRegistering(true);

    const registrationPromise = new Promise(async (resolve, reject) => {
      try {
        const metadata = {
          name: `Arche AI Art: ${committedPrompt.substring(0, 50)}...`,
          description: committedPrompt,
          attributes: [
            { trait_type: "Prompt", value: committedPrompt },
            { trait_type: "Engine", value: "Arche v1" },
            { trait_type: "License Type", value: licenseParams.type },
          ],
          originalPrompt: committedPrompt,
        };

        const requestBody = {
          metadata: metadata,
          imageUrl: committedImageUrl,
          recipient: account,
          parentId: parentIpId || null,
          licenseParams: licenseParams,
          draftId: activeDraftId === "new" ? undefined : activeDraftId,
        };

        const res = await fetch("/api/story/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to register IP.");

        handleReset();
        router.push("/profile"); // Redirect to profile on success
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(registrationPromise, {
      loading: "Minting IP Asset on Story Protocol...",
      success: (data: any) => {
        return `IP Registered! ID: ${data.ipId?.slice(0, 8)}...`;
      },
      error: (err: any) => `Registration failed: ${err.message}`,
    });

    try {
      await registrationPromise;
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegistering(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-arche-navy selection:bg-arche-gold/30 selection:text-arche-gold">
      <SiteHeader />

      {!activeDraftId ? (
        /* DASHBOARD VIEW */
        <StudioDashboard
          history={history}
          onSelectDraft={handleDashboardSelect}
          onNewProject={handleNewProject}
        />
      ) : (
        /* EDITOR VIEW */
        <div className="flex flex-1 relative animate-in fade-in duration-300">
          {/* Left Sidebar: History */}
          <aside className="w-64 shrink-0 hidden lg:block z-20 sticky top-14 h-[calc(100vh-3.5rem)]">
            <div className="h-full border-r border-white/5 bg-[#0b1628]/80 backdrop-blur-xl flex flex-col">
              {/* Back Button */}
              <div className="p-4 border-b border-white/5">
                <button
                  onClick={handleBackToDashboard}
                  className="flex items-center gap-2 text-xs text-white/60 hover:text-arche-gold transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to Hub
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <VersionHistory
                  history={history}
                  onSelectVersion={handleVersionSelect}
                />
              </div>
            </div>
          </aside>

          {/* Center Stage: Editor */}
          <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-[#0b1628] to-[#08101d] relative overflow-y-auto">
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('/images/noise.png')] mix-blend-overlay fixed"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-arche-gold/5 rounded-full blur-[120px] pointer-events-none fixed"></div>

            <div className="flex-1 p-8 space-y-8 max-w-5xl mx-auto w-full relative z-10 pb-20">
              <div className="space-y-6">
                <PromptEditor
                  value={stagedPrompt}
                  onChange={setStagedPrompt}
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                />
                <AIOutputPanel
                  output={output}
                  imageUrl={stagedImageUrl}
                  onSave={handleCommit}
                  onRegister={handleRegister}
                  onRevert={handleRevert}
                  onImageLoad={handleImageLoad} // Pass callback
                  isRegistering={isRegistering}
                  isGenerating={isGenerating}
                  isDirty={isDirty}
                />
                {loading && (
                  <div className="flex items-center justify-center gap-2 text-xs text-arche-gold/60 animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-arche-gold"></div>
                    Syncing...
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* Right Sidebar: Config */}
          <aside className="w-80 shrink-0 hidden lg:block z-20 sticky top-14 h-[calc(100vh-3.5rem)]">
            <AssetConfig
              licenseParams={licenseParams}
              onLicenseChange={setLicenseParams}
              parentIpId={parentIpId}
              onParentIpIdChange={setParentIpId}
              disabled={isRegistering || isGenerating}
            />
          </aside>
        </div>
      )}
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-arche-navy flex items-center justify-center text-white font-mono text-sm">
          Loading Studio...
        </div>
      }
    >
      <StudioContent />
    </Suspense>
  );
}
