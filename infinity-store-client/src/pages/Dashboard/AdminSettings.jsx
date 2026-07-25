import { useState, useRef} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Settings, Upload, Camera, Loader2, X } from "lucide-react";
import { getSettings, updateSettings } from "@/services/settings.api";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

export default function AdminSettings() {
  const { siteName: settingsName } = useSettings();
  const queryClient = useQueryClient();
  const { isLoading, data } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  const [siteName, setSiteName] = useState("");
  const [siteNameEdited, setSiteNameEdited] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoDrag, setLogoDrag] = useState(false);
  const logoInputRef = useRef(null);

  const displaySiteName = siteNameEdited ? siteName : (data?.siteName || "");
  const displayLogo = logoPreview || data?.logo || "";

  const handleSiteNameChange = (e) => {
    setSiteNameEdited(true);
    setSiteName(e.target.value);
  };

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (res) => {
      toast.success("Settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      if (res.data?.siteName) {
        setSiteName(res.data.siteName);
        setSiteNameEdited(true);
      }
      if (res.data?.logo) {
        setLogoPreview(res.data.logo);
        setLogoFile(null);
      }
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update settings");
    },
  });

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleLogoChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasSiteName = displaySiteName.trim().length > 0;
    const hasLogo = displayLogo && displayLogo.length > 0;

    if (!hasSiteName && !hasLogo) {
      toast.error("Please enter a site name and upload a logo");
      return;
    }
    if (!hasSiteName) {
      toast.error("Please enter a site name");
      return;
    }
    if (!hasLogo) {
      toast.error("Please upload a logo");
      return;
    }

    let logo = displayLogo;
    if (logoFile) {
      logo = await toBase64(logoFile);
    }
    mutation.mutate({ siteName: displaySiteName, logo });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>{`Settings | ${settingsName}`}</title>
      </Helmet>

      <div className="flex items-center gap-3">
        <Settings className="size-6 text-foreground" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Site Settings</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Site Name</label>
          <Input
            value={displaySiteName}
            onChange={handleSiteNameChange}
            placeholder={settingsName}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Logo</label>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleLogoChange(file);
              e.target.value = "";
            }}
          />
          <div
            onClick={() => logoInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setLogoDrag(true); }}
            onDragLeave={() => setLogoDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setLogoDrag(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleLogoChange(file);
            }}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-5 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 ${logoDrag ? "border-primary bg-primary/10 scale-[1.01]" : "border-border"}`}
          >
            {displayLogo ? (
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={displayLogo}
                    alt="Logo"
                    className="h-16 w-16 rounded-xl object-contain ring-2 ring-border"
                  />
                  <div className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Camera className="size-3" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Change logo</p>
                  {logoFile && (
                    <p className="text-xs text-muted-foreground">{formatFileSize(logoFile.size)}</p>
                  )}
                  <p className="text-xs text-muted-foreground">JPEG, PNG, WebP, SVG, GIF, AVIF</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLogoFile(null);
                    setLogoPreview("");
                    if (logoInputRef.current) logoInputRef.current.value = "";
                  }}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className={`flex size-16 items-center justify-center rounded-xl transition-colors ${logoDrag ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                  <Upload className="size-7" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Click to upload logo</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">JPEG, PNG, WebP, SVG, GIF, AVIF</p>
                  <p className="mt-1.5 text-xs text-primary">or drag & drop</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </form>
    </div>
  );
}
