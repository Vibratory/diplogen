"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Upload, Filter, Star, Download } from "lucide-react"
import Image from "next/image"
import { AdBanner } from "@/components/ad-banner"
import { useTranslation } from "@/hooks/use-translation"
import Link from 'next/link';

import { useUser, SignInButton, SignOutButton } from '@clerk/nextjs';

const templates = [
  {
    id: 1,
    title: "Classic University Diploma",
    category: "education",
    description: "Traditional university-style diploma with elegant borders and formal typography",
    image: "/placeholder-x3pk1.png",
    downloads: 1250,
    rating: 4.8,
    tags: ["university", "formal", "classic"],
  },
  {
    id: 2,
    title: "Modern Certificate",
    category: "education",
    description: "Clean, modern design perfect for professional certifications and courses",
    image: "/modern-clean-certificate.png",
    downloads: 890,
    rating: 4.6,
    tags: ["modern", "professional", "clean"],
  },
  {
    id: 3,
    title: "Achievement Award",
    category: "awards",
    description: "Colorful achievement certificate for competitions and recognition",
    image: "/colorful-achievement-award.png",
    downloads: 650,
    rating: 4.7,
    tags: ["achievement", "colorful", "award"],
  },
  {
    id: 4,
    title: "Training Completion",
    category: "training",
    description: "Professional training completion certificate for corporate use",
    image: "/placeholder-2atv6.png",
    downloads: 420,
    rating: 4.5,
    tags: ["training", "corporate", "professional"],
  },
  {
    id: 5,
    title: "Academic Excellence",
    category: "education",
    description: "Premium academic excellence certificate with gold accents",
    image: "/placeholder-80x6v.png",
    downloads: 780,
    rating: 4.9,
    tags: ["academic", "excellence", "premium"],
  },
  {
    id: 6,
    title: "Workshop Certificate",
    category: "training",
    description: "Simple workshop completion certificate with customizable fields",
    image: "/simple-workshop-certificate.png",
    downloads: 340,
    rating: 4.4,
    tags: ["workshop", "simple", "customizable"],
  },
]

export default function TemplatesPage() {
  const { t } = useTranslation()
  const { isSignedIn, user } = useUser()
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-4">{t("templatesTitle")}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">{t("templatesSubtitle")}</p>
          
          {isSignedIn ? (
            <Link href="/templates/upload">
              <Button size="lg" className="mb-8">
                <Upload className="h-5 w-5 mr-2" />
                {t("uploadTemplate")}
              </Button>
            </Link>
          ) : null}

        </div>


        <div className="mb-8 flex justify-center">
          <AdBanner slot="2468135790" format="horizontal" className="max-w-2xl" />
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("searchPlaceholder")} className="pl-10" />
          </div>
          <Button variant="outline" className="md:w-auto bg-transparent">
            <Filter className="h-4 w-4 mr-2" />
            {t("filters")}
          </Button>
        </div>

        {/* Category Tabs */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8">
            <TabsTrigger value="all">{t("allTemplates")}</TabsTrigger>
            <TabsTrigger value="education">{t("education")}</TabsTrigger>
            <TabsTrigger value="awards">{t("awards")}</TabsTrigger>
            <TabsTrigger value="training">{t("training")}</TabsTrigger>
            <TabsTrigger value="custom">{t("custom")}</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
            <div className="mt-12 flex justify-center">
              <AdBanner slot="1357924680" format="rectangle" className="max-w-md" />
            </div>
          </TabsContent>

          <TabsContent value="education">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates
                .filter((t) => t.category === "education")
                .map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="awards">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates
                .filter((t) => t.category === "awards")
                .map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="training">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates
                .filter((t) => t.category === "training")
                .map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="custom">
            <div className="text-center py-12">
              <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-bold font-serif mb-2">{t("uploadOwnTemplate")}</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">{t("uploadOwnTemplateDesc")}</p>
              <Button size="lg">
                <Upload className="h-5 w-5 mr-2" />
                {t("chooseFiles")}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div >
  )
}

function TemplateCard({ template }: { template: (typeof templates)[0] }) {
  const { t } = useTranslation()

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border">
      <div className="relative overflow-hidden rounded-t-lg">
        <Image
          src={template.image || "/placeholder.svg"}
          alt={template.title}
          width={400}
          height={300}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
            {template.category}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="font-serif text-lg leading-tight">{template.title}</CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {template.rating}
          </div>
        </div>
        <CardDescription className="text-sm leading-relaxed">{template.description}</CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Download className="h-4 w-4" />
            {template.downloads.toLocaleString()} {t("downloads")}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {template.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" size="sm">
            {t("useTemplate")}
          </Button>
          <Button variant="outline" size="sm">
            {t("preview")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
