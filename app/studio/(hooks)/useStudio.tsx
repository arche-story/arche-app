"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useWallet } from "@/components/wrapper/WalletProvider";
import { useProjectHistory } from "@/hooks/useProjectHistory";
import { useUserProfile } from "@/hooks/useUserProfile"; // Added import
import { LicenseParams } from "@/types/license";
import { toast } from "sonner";

const TEST_USER = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
const POLLINATIONS_API_BASE_URL = "https://image.pollinations.ai/prompt";

export function useStudio() {
  const searchParams = useSearchParams();
  const params = useParams();
  const routeId = params?.slug ? params.slug[0] : null;

  const draftPromptParam = searchParams.get("prompt");
  const remixIdParam = searchParams.get("remix");

  const { account, connectWallet } = useWallet();
  const router = useRouter();
  const { profile: userProfile } = useUserProfile(account || undefined); // Fetch user profile

  const [activeDraftId, setActiveDraftId] = useState<string | null>(routeId);
  const [isNewProject, setIsNewProject] = useState(routeId === "new");

  const { history, saveDraft, loading } = useProjectHistory(
    account || TEST_USER,
    activeDraftId,
    7 // Limit recent activity to 7 items for the Dashboard
  );

  // Dialog States
  const [showRevertDialog, setShowRevertDialog] = useState(false);
  const [showBackDialog, setShowBackDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);

  // Editor State
  const [committedPrompt, setCommittedPrompt] = useState(draftPromptParam || "");
  const [committedImageUrl, setCommittedImageUrl] = useState<string | null>(null);
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
  const [parentIpData, setParentIpData] = useState<any>(null);
  const [loadingParentData, setLoadingParentData] = useState(false);

  const isDirty = stagedPrompt !== committedPrompt || stagedImageUrl !== committedImageUrl;

  // Initial Effect
  useEffect(() => {
    if (routeId) {
      setActiveDraftId(routeId);
      setIsNewProject(routeId === "new");
      if (routeId === "new" && remixIdParam) {
        setParentIpId(remixIdParam);
      }
    } else {
      setActiveDraftId(null);
      setIsNewProject(false);
    }
  }, [routeId, remixIdParam]);

  // Restore Effect
  useEffect(() => {
    if (activeDraftId && activeDraftId !== "new" && history.length > 0) {
      const activeDraft = history.find((h) => h.id === activeDraftId);
      if (activeDraft) {
        if (committedPrompt === "" && committedImageUrl === null) {
          restoreVersion(activeDraft);
        }
      }
    } else if (draftPromptParam && isNewProject) {
      setStagedPrompt(draftPromptParam);
      setCommittedPrompt(draftPromptParam);
    }
  }, [activeDraftId, history, draftPromptParam, isNewProject]);

  // Parent Data Effect
  useEffect(() => {
    const fetchParentIpData = async () => {
      if (parentIpId) {
        setLoadingParentData(true);
        try {
          const response = await fetch(`/api/graph/data?ipId=${parentIpId}`);
          const data = await response.json();

          if (data.nodes && data.nodes.length > 0) {
            const ipAsset = data.nodes[0];
            if (ipAsset.metadataUri) {
              try {
                const metadataResponse = await fetch(
                  ipAsset.metadataUri.startsWith("ipfs://")
                    ? ipAsset.metadataUri.replace("ipfs://", "https://ipfs.io/ipfs/")
                    : ipAsset.metadataUri
                );
                const metadata = await metadataResponse.json();
                setParentIpData({ ...ipAsset, metadata });

                if (!stagedPrompt && metadata.ai_context?.prompt) {
                  setStagedPrompt(metadata.ai_context.prompt);
                } else if (!stagedPrompt && metadata.prompt) {
                  setStagedPrompt(metadata.prompt);
                }
              } catch (metadataError) {
                setParentIpData(ipAsset);
              }
            } else {
              setParentIpData(ipAsset);
            }
          }
        } catch (error) {
          console.error("Failed to fetch parent IP data:", error);
        } finally {
          setLoadingParentData(false);
        }
      }
    };
    fetchParentIpData();
  }, [parentIpId]);

  const restoreVersion = (version: any) => {
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

  const handleDashboardSelect = (draftId: string, prompt: string, imageUrl?: string) => {
    setActiveDraftId(draftId);
    setStagedPrompt(prompt);
    setCommittedPrompt(prompt);
    let uri = imageUrl;
    if (uri?.startsWith("ipfs://"))
      uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
    setStagedImageUrl(uri || null);
    setCommittedImageUrl(uri || null);
    router.push(`/studio/${draftId}`);
  };

  const handleNewProject = () => {
    handleReset();
    router.push(`/studio/new`);
  };

  const handleReset = useCallback(() => {
    setStagedPrompt("");
    setCommittedPrompt("");
    setStagedImageUrl(null);
    setCommittedImageUrl(null);
    setOutput(null);
    setParentIpId("");
  }, []);

  const handleBackToDashboard = () => {
    if (isDirty) {
      setShowBackDialog(true);
    } else {
      handleReset();
      router.push(`/studio`);
    }
  };

  const confirmBack = () => {
    setShowBackDialog(false);
    handleReset();
    router.push(`/studio`);
  };

  const handleVersionSelect = useCallback(
    (versionId: string) => {
      const selectedVersion = history.find((v) => v.id === versionId);
      if (selectedVersion) {
        restoreVersion(selectedVersion);
        toast.info("Version restored");
        if (selectedVersion.id !== activeDraftId) {
          router.push(`/studio/${selectedVersion.id}`);
        }
      }
    },
    [history, activeDraftId, router]
  );

  const handleImageLoad = useCallback(() => {
    if (isGenerating) {
      setIsGenerating(false);
      toast.success("Preview generated! Commit to save.");
    }
  }, [isGenerating]);

  function handleGenerate() {
    if (!stagedPrompt) return;
    if (stagedImageUrl) {
      setShowGenerateDialog(true);
    } else {
      confirmGenerate();
    }
  }

  async function confirmGenerate() {
    setShowGenerateDialog(false);
    if (!stagedPrompt) return;
    setIsGenerating(true);
    setStagedImageUrl(null);
    setOutput("Generating image from prompt...");

    try {
      const encodedPrompt = encodeURIComponent(stagedPrompt);
      const imageUrl = `${POLLINATIONS_API_BASE_URL}/${encodedPrompt}`;
      setStagedImageUrl(imageUrl);
      setOutput(`Preview generated for: "${stagedPrompt}"`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate image.");
      setIsGenerating(false);
    }
  }

  function handleCommit() {
    if (!stagedImageUrl || !stagedPrompt) return;
    setShowCommitDialog(true);
  }

  async function confirmCommit() {
    setShowCommitDialog(false);
    if (!stagedImageUrl || !stagedPrompt) return;

    const commitPromise = new Promise(async (resolve, reject) => {
      try {
        const targetId = activeDraftId === "new" ? undefined : activeDraftId;
        const newDraftId = await saveDraft(
          stagedPrompt,
          parentIpId || undefined,
          targetId || undefined,
          stagedImageUrl || undefined
        );
        if (newDraftId) {
          setCommittedPrompt(stagedPrompt);
          setCommittedImageUrl(stagedImageUrl);
          setActiveDraftId(newDraftId);
          if (!parentIpId && (activeDraftId === "new" || activeDraftId !== newDraftId)) {
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
    setShowRevertDialog(true);
  }

  const confirmRevert = () => {
    setStagedPrompt(committedPrompt);
    setStagedImageUrl(committedImageUrl);
    setShowRevertDialog(false);
    toast.info("Changes reverted.");
  };

  async function handleFork() {
    if (isDirty) {
      toast.warning("Please commit your changes before forking.");
      return;
    }
    if (!account) {
      toast.warning("Connect wallet to fork IP");
      await connectWallet();
      return;
    }
    setIsRegistering(true);

    const forkPromise = new Promise(async (resolve, reject) => {
      try {
        const metadata = {
          title: `Arche Fork: ${committedPrompt.substring(0, 50)}...`,
          description: committedPrompt,
          created_at: new Date().toISOString(),
          arche_type: "GENESIS",
          ai_context: {
            model: "Pollinations AI",
            prompt: committedPrompt,
            negative_prompt: "",
            seed: Math.floor(Math.random() * 100000000),
            guidance_scale: 7.5
          },
          parent_context: {
            parent_ip_id: parentIpId,
            transformation_method: "fork"
          },
          app_context: {
            version: "arche-v1.0",
            engine: "arche-gen-engine"
          },
          licenseType: "NON_COMMERCIAL"
        };

        const requestBody = {
          metadata: metadata,
          imageUrl: committedImageUrl,
          recipient: account,
          parentId: null,
          forkedFrom: parentIpId,
          licenseParams: { type: "NON_COMMERCIAL" },
          draftId: activeDraftId === "new" ? undefined : activeDraftId,
        };

        const res = await fetch("/api/story/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fork IP.");

        handleReset();
        router.push("/profile");
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(forkPromise, {
      loading: "Minting Forked Asset (Genesis)...",
      success: (data: any) => (
        <div>
          <p>Asset Forked Successfully!</p>
          <a href={data.explorerUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-xs block mt-1">
            View on StoryScan
          </a>
        </div>
      ),
      error: (err: any) => `Fork failed: ${err.message}`,
    });

    try {
      await forkPromise;
    } finally {
      setIsRegistering(false);
    }
  }

  function handleRegister() {
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
      connectWallet();
      return;
    }
    setShowRegisterDialog(true);
  }

  async function confirmRegister() {
    setShowRegisterDialog(false);
    setIsRegistering(true);

    const registrationPromise = new Promise(async (resolve, reject) => {
      try {
        const metadata = {
          title: `Arche AI Art: ${committedPrompt.substring(0, 50)}...`,
          description: committedPrompt,
          created_at: new Date().toISOString(),
          arche_type: parentIpId ? "REMIX" : "GENESIS",
          ai_context: {
            model: "Pollinations AI",
            prompt: committedPrompt,
            negative_prompt: "",
            seed: Math.floor(Math.random() * 100000000),
            guidance_scale: 7.5
          },
          parent_context: parentIpId ? {
            parent_ip_id: parentIpId,
            transformation_method: "remix"
          } : undefined,
          app_context: {
            version: "arche-v1.0",
            engine: "arche-gen-engine"
          },
          licenseType: licenseParams.type
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
        router.push("/profile");
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(registrationPromise, {
      loading: "Minting IP Asset on Story Protocol...",
      success: (data: any) => {
        return (
          <div>
            <p>IP Registered Successfully!</p>
            <a href={data.explorerUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-xs block mt-1">
              View on StoryScan
            </a>
          </div>
        );
      },
      error: (err: any) => `Registration failed: ${err.message}`,
    });

    try {
      await registrationPromise;
    } catch (e: any) {
      console.error(e);
      if (parentIpId && (e.message.includes("Not enough IP tokens") || e.message.includes("payment") || e.message.includes("fee"))) {
         toast.custom((t) => (
             <div className="bg-slate-900 border border-red-500/50 p-4 rounded-lg shadow-xl flex flex-col gap-3 w-full max-w-md">
                 <div className="flex items-start gap-3">
                     <div className="text-red-400 font-bold shrink-0">⚠️ Remix Failed</div>
                     <div className="text-sm text-slate-300">{e.message}</div>
                 </div>
                 <div className="text-xs text-slate-400">
                     You can &quot;Fork&quot; this asset instead. It will be registered as a new Genesis IP (Non-Commercial) without paying the parent fee, but will still be linked as an inspiration.
                 </div>
                 <div className="flex gap-2 justify-end">
                     <button onClick={() => toast.dismiss(t)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">Cancel</button>
                     <button onClick={() => { toast.dismiss(t); handleFork(); }} className="px-3 py-1.5 text-xs bg-arche-gold text-slate-900 font-bold rounded hover:bg-white transition-colors">Fork Asset</button>
                 </div>
             </div>
         ), { duration: 15000 });
      }
    } finally {
      setIsRegistering(false);
    }
  }

  return {
    activeDraftId,
    history,
    loading,
    handleDashboardSelect,
    handleNewProject,
    handleBackToDashboard,
    handleVersionSelect,
    handleGenerate,
    handleCommit,
    handleRegister,
    handleRevert,
    confirmBack,
    confirmGenerate,
    confirmCommit,
    confirmRegister,
    confirmRevert,
    stagedPrompt,
    setStagedPrompt,
    stagedImageUrl,
    setStagedImageUrl,
    output,
    licenseParams,
    setLicenseParams,
    parentIpId,
    setParentIpId,
    isRegistering,
    isGenerating,
    isDirty,
    parentIpData,
    loadingParentData,
    handleImageLoad,
    // Dialog states
    showBackDialog, setShowBackDialog,
    showGenerateDialog, setShowGenerateDialog,
    showCommitDialog, setShowCommitDialog,
    showRegisterDialog, setShowRegisterDialog,
    showRevertDialog, setShowRevertDialog,
    // Wallet & User
    account,
    connectWallet,
    userProfile
  };
}
