import { TemplateUpload } from "@/components/template-upload"

export default function UploadTemplatePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-serif text-foreground mb-4">Upload Your Template</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Share your custom diploma template with the community or use it for your own projects
          </p>
        </div>

        <TemplateUpload />
      </div>
    </div>
  )
}
