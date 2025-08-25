"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Upload, Edit, Download, Users, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { AdBanner } from "@/components/ad-banner"
import { useTranslation } from "@/hooks/use-translation"

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6">
            100% Free Forever
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold font-serif text-foreground mb-6 leading-tight">
            {t("heroTitle")}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">{t("heroSubtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/editor">
              <Button size="lg" className="text-lg px-8 py-6">
                {t("getStarted")}
              </Button>
            </Link>
            <Link href="/templates">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
                {t("browseTemplates")}
              </Button>
            </Link>
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

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-serif text-foreground mb-4">{t("featuresTitle")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional tools and templates to generate certificates for any occasion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Upload className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="font-serif">{t("feature1Title")}</CardTitle>
                <CardDescription>{t("feature1Desc")}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Edit className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="font-serif">{t("feature2Title")}</CardTitle>
                <CardDescription>{t("feature2Desc")}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="font-serif">{t("feature3Title")}</CardTitle>
                <CardDescription>{t("feature3Desc")}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Download className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="font-serif">{t("feature4Title")}</CardTitle>
                <CardDescription>{t("feature4Desc")}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="font-serif">{t("feature5Title")}</CardTitle>
                <CardDescription>{t("feature5Desc")}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="font-serif">{t("feature6Title")}</CardTitle>
                <CardDescription>{t("feature6Desc")}</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Ad Banner after Features Grid */}
          <div className="mt-16 flex justify-center">
            <AdBanner slot="0987654321" format="rectangle" className="max-w-md" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold font-serif text-foreground mb-6">{t("ctaTitle")}</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of educators and administrators who trust DiplomaGen for their certificate needs.
          </p>
          <Link href="/editor">
            <Button size="lg" className="text-lg px-8 py-6">
              {t("getStartedNow")}
            </Button>
          </Link>
        </div>
      </section>

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
