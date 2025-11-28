"use client";

import { SiteHeader } from "@/components/site-header";
import { PromptEditor } from "@/app/studio/(components)/prompt-editor";
import { AIOutputPanel } from "@/app/studio/(components)/ai-output-panel";
import { VersionHistory } from "@/components/studio/VersionHistory";
import { AssetConfig } from "@/components/studio/AssetConfig";
import { StudioDashboard } from "@/app/studio/(components)/studio-dashboard";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ArrowLeft } from "lucide-react";
import { useStudio } from "@/app/studio/(hooks)/useStudio";

export function StudioMain() {
  const {
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
    showBackDialog, setShowBackDialog,
    showGenerateDialog, setShowGenerateDialog,
    showCommitDialog, setShowCommitDialog,
    showRegisterDialog, setShowRegisterDialog,
    showRevertDialog, setShowRevertDialog,
    userProfile
  } = useStudio();

  return (
    <div className="flex flex-col min-h-screen bg-arche-navy selection:bg-arche-gold/30 selection:text-arche-gold">
      <SiteHeader />

      {!activeDraftId ? (
        /* DASHBOARD VIEW */
        <StudioDashboard
          history={history}
          userProfile={userProfile}
          onSelectDraft={handleDashboardSelect}
          onNewProject={handleNewProject}
          onRemixAsset={(ipId) => {
            // Navigate to remix mode with the IP ID
            // Since we use router.push in handleDashboardSelect, we need a way to trigger remix mode directly
            // We can expose router or a specific remix handler in useStudio, but for now, let's pass a simple callback
            // Actually, StudioDashboard uses router.push directly in the original code.
            // In useStudio, we can expose router logic if needed, or let StudioDashboard handle simple routing.
            // But wait, StudioDashboard in original code uses router.push. Let's keep it simple or update it.
            // The original prop `onRemixAsset` was used. Let's see StudioDashboard implementation.
            // It calls onRemixAsset OR router.push. We passed a callback in page.tsx.
            // Let's replicate that behavior.
            window.location.href = `/studio/new?remix=${ipId}`; // Simple redirect or use router
          }}
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
                  parentIpId={parentIpId}
                  parentIpData={parentIpData}
                  loadingParentData={loadingParentData}
                />
                {loading && (
                  <div className="flex items-center justify-center gap-2 text-xs text-arche-gold/60 animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-arche-gold"></div>
                    Syncing...
                  </div>
                )}
              </div>
            </div>

            {/* Confirmation Dialogs */}
            <ConfirmationDialog
                open={showGenerateDialog}
                onOpenChange={setShowGenerateDialog}
                title="Generate New Image?"
                description="This will generate a new image based on your prompt. Any unsaved changes to the current image will be replaced."
                actionLabel="Paint It"
                variant="info"
                onAction={confirmGenerate}
            />

            <ConfirmationDialog
                open={showCommitDialog}
                onOpenChange={setShowCommitDialog}
                title="Commit Version?"
                description="This will save the current image and prompt as a new version in your history. You can always revert to previous versions."
                actionLabel="Commit Version"
                variant="info"
                onAction={confirmCommit}
            />

            <ConfirmationDialog
                open={showRegisterDialog}
                onOpenChange={setShowRegisterDialog}
                title="Register IP Asset?"
                description="You are about to mint an NFT and register this asset on the Story Protocol blockchain. This action requires a wallet transaction."
                actionLabel="Sign & Register"
                variant="warning"
                onAction={confirmRegister}
            />

            <ConfirmationDialog
                open={showRevertDialog}
                onOpenChange={setShowRevertDialog}
                title="Revert Changes?"
                description="This will discard all unsaved changes and revert to the last committed version. Are you sure?"
                actionLabel="Revert"
                variant="warning"
                onAction={confirmRevert}
            />

            <ConfirmationDialog
                open={showBackDialog}
                onOpenChange={setShowBackDialog}
                title="Unsaved Changes"
                description="You have unsaved changes. If you leave now, your work will be lost. Are you sure?"
                actionLabel="Leave Studio"
                variant="danger"
                onAction={confirmBack}
            />
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
