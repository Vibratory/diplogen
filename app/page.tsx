"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Upload, Edit, Download, Users, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { AdBanner } from "@/components/ad-banner"
import { useTranslation } from "@/hooks/use-translation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileUpload } from "@/components/file-upload"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function HomePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [selectedMode, setSelectedMode] = useState<"single" | "bulk">("single")
  type TemplateRecord = { id: string; name: string; image: string; description?: string; uses?: number }
  const [availableTemplates, setAvailableTemplates] = useState<TemplateRecord[]>([
    { id: "local-1", name: "Professional Diploma", image: "/professional-diploma-template.png" },
    { id: "local-2", name: "Classic Diploma", image: "/classic-diploma-template.png" },
    { id: "local-3", name: "Modern Certificate", image: "/modern-clean-certificate.png" },
    { id: "local-4", name: "Elegant Diploma", image: "/elegant-diploma-template.png" },
  ])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("/professional-diploma-template.png")

  const openTemplateDialog = (mode: "single" | "bulk") => {
    setSelectedMode(mode)
    setTemplateDialogOpen(true)
  }

  const handleContinue = () => {
    const params = new URLSearchParams()
    params.set("mode", selectedMode === "bulk" ? "bulk" : "single")
    if (selectedTemplate) params.set("template", selectedTemplate)
    router.push(`/editor?${params.toString()}`)
    setTemplateDialogOpen(false)
  }

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/templates?approved=true", { cache: "no-store" } as RequestInit)
        if (res.ok) {
          const data = await res.json()
          const rows: TemplateRecord[] = (data.templates ?? data ?? [])
            .map((t: any, idx: number) => ({
              id: t.id?.toString?.() ?? `db-${idx}`,
              name: t.name ?? `Template ${idx + 1}`,
              image: t.image ?? t.url ?? t.previewUrl ?? "",
              uses: t.uses ?? t.use_count ?? t.generatedDiplomas ?? t.generated_count ?? 0,
            }))
            .filter((r: TemplateRecord) => r.image)
          if (rows.length) {
            setAvailableTemplates(rows)
            setSelectedTemplate(rows[0].image)
          }
        }
      } catch {}
    })()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select a template</DialogTitle>
            <DialogDescription>Choose a template or upload your own. You can change it later in the editor.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableTemplates.map((tpl, idx) => (
              <div
                key={tpl.id ?? idx}
                className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-colors ${selectedTemplate === tpl.image ? "border-primary" : "border-border hover:border-primary/50"}`}
                onClick={() => {
                  const params = new URLSearchParams()
                  params.set("template", tpl.image)
                  router.push(`/editor?${params.toString()}`)
                  setTemplateDialogOpen(false)
                }}
              >
                <img src={tpl.image || "/placeholder.svg"} alt={tpl.name || `Template ${idx + 1}`} className="w-full h-24 object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 truncate">
                  {tpl.name}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <FileUpload
              type="image"
              onUploadComplete={async (file) => {
                if (file?.url) {
                  let destUrl: string = file.url
                  if (typeof destUrl === "string" && destUrl.startsWith("data:")) {
                    try {
                      const res = await fetch(destUrl)
                      const blob = await res.blob()
                      destUrl = URL.createObjectURL(blob)
                    } catch {
                      // Fallback to token if object URL conversion fails
                      const token = `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
                      try { localStorage.setItem(`tpl:${token}`, destUrl) } catch {}
                      router.push(`/editor?templateToken=${token}`)
                      setTemplateDialogOpen(false)
                      return
                    }
                  }
                  const params = new URLSearchParams(); params.set("template", destUrl)
                  router.push(`/editor?${params.toString()}`)
                  setTemplateDialogOpen(false)
                }
              }}
            />
            <p className="mt-2 text-[11px] text-muted-foreground">For best results, upload a high-resolution JPG or PNG image of your template.</p>
          </div>
        </DialogContent>
      </Dialog>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-block mb-6 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm md:text-xl font-extrabold uppercase tracking-wide shadow-sm">
            100% FREE FOREVER
          </div>
          <h1 className="text-5xl md:text-6xl font-bold font-serif text-foreground mb-6 leading-tight">
            {t("heroTitle")}
          </h1>
          <p className="text-xl text-muted-foreground mb-2 max-w-2xl mx-auto leading-relaxed">{t("heroSubtitle")}</p>
          <p className="text-xs text-muted-foreground mb-8">Tip: Backgrounds work best with JPG/PNG images. PDFs/DOCX are not supported as backgrounds.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-6" onClick={() => openTemplateDialog("single")}>
              Upload your own
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent" onClick={() => openTemplateDialog("bulk")}>
              Pick from templates
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">50,000+</div>
              <div className="text-muted-foreground">Diplomas Generated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <div className="text-muted-foreground">Free to Use</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Banner after Hero Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <AdBanner slot="1234567890" format="horizontal" className="max-w-2xl mx-auto" />
        </div>
      </section>

      {/* How It Works - Clarity for new users */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-foreground text-center mb-6">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-primary/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Upload className="h-4 w-4 text-primary" /> Upload Template Image
                  </CardTitle>
                </div>
                <CardDescription>Upload a high-resolution JPG/PNG of your diploma or pick a ready-made design.</CardDescription>
                <div className="mt-2">
                  <Button size="sm" onClick={() => openTemplateDialog("single")}>Upload Template</Button>
                </div>
              </CardHeader>
            </Card>
            <Card className="border-primary/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Edit className="h-4 w-4 text-primary" /> Place Fields
                  </CardTitle>
                </div>
                <CardDescription>Drag and drop name, degree, date fields exactly where they should appear on the canvas.</CardDescription>
                <div className="mt-2">
                  <Button size="sm" variant="outline" className="bg-transparent" onClick={() => router.push('/editor')}>Open Editor</Button>
                </div>
              </CardHeader>
            </Card>
            <Card className="border-primary/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Download className="h-4 w-4 text-primary" /> Generate PDFs
                  </CardTitle>
                </div>
                <CardDescription>Preview one or bulk-generate hundreds. Download instantly.</CardDescription>
                <div className="mt-2">
                  <Button size="sm" variant="outline" className="bg-transparent" onClick={() => openTemplateDialog("bulk")}>Bulk Generate</Button>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Most Used Templates */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-foreground mb-6">Most Used Templates</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...availableTemplates]
              .sort((a, b) => (b.uses || 0) - (a.uses || 0))
              .slice(0, 6)
              .map((tpl, idx) => (
                <div
                  key={tpl.id ?? idx}
                  className="relative cursor-pointer border-2 rounded-lg overflow-hidden transition-colors border-border hover:border-primary/50"
                  onClick={() => {
                    const params = new URLSearchParams();
                    params.set("template", tpl.image)
                    router.push(`/editor?${params.toString()}`)
                  }}
                >
                  <img src={tpl.image || "/placeholder.svg"} alt={tpl.name || `Template ${idx + 1}`} className="w-full h-28 object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 flex items-center justify-between">
                    <span className="truncate pr-1">{tpl.name}</span>
                    {typeof tpl.uses === "number" && tpl.uses > 0 && (
                      <span className="opacity-90">{tpl.uses}</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Features Section with mid-page ad for better monetization */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-serif text-foreground mb-4">{t("featuresTitle")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional tools and templates to generate certificates for any occasion
            </p>
          </div>

          {/* Removed features grid per request */}

          {/* Ad Banner after Features Grid */}
          <div className="mt-16 flex justify-center">
            <AdBanner slot="0987654321" format="rectangle" className="max-w-md" />
          </div>
          <div className="mt-6 flex justify-center">
            <AdBanner slot="6543210987" format="rectangle" className="max-w-md" />
          </div>
        </div>
      </section>

      {/* CTA section removed per request */}

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold font-serif">DiplomaGen</span>
              </div>
              <p className="text-muted-foreground text-sm">
                The free, professional diploma generator trusted by educators worldwide.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/templates" className="hover:text-foreground transition-colors">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="/editor" className="hover:text-foreground transition-colors">
                    Editor
                  </Link>
                </li>
                <li>
                  <Link href="/features" className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 DiplomaGen. All rights reserved. Made with ❤️ for educators.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
