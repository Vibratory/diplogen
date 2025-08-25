"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface AdBannerProps {
  slot?: string
  format?: "auto" | "rectangle" | "vertical" | "horizontal"
  responsive?: boolean
  className?: string
}

export function AdBanner({ slot = "1234567890", format = "auto", responsive = true, className = "" }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && adRef.current) {
      try {
        // Initialize AdSense
        ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
        ;(window as any).adsbygoogle.push({})
      } catch (error) {
        console.error("AdSense error:", error)
      }
    }
  }, [])

  return (
    <Card className={`border-dashed min-w-[300px] ${className}`}>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground mb-2 text-center">Advertisement</div>
        <div ref={adRef} className="min-h-[250px] min-w-[300px]">
          <ins
            className="adsbygoogle"
            style={{
              display: "block",
              minWidth: "300px",
              minHeight: "250px",
            }}
            data-ad-client="ca-pub-0000000000000000"
            data-ad-slot={slot}
            data-ad-format={format === "auto" ? "rectangle" : format}
            data-full-width-responsive={responsive.toString()}
          />
        </div>
      </CardContent>
    </Card>
  )
}

interface CustomAdProps {
  title: string
  description: string
  imageUrl?: string
  linkUrl: string
  className?: string
}

export function CustomAd({ title, description, imageUrl, linkUrl, className = "" }: CustomAdProps) {
  return (
    <Card className={`border-dashed hover:shadow-md transition-shadow cursor-pointer ${className}`}>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground mb-2 text-center">Sponsored</div>
        <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block">
          {imageUrl && (
            <div className="mb-3">
              <img src={imageUrl || "/placeholder.svg"} alt={title} className="w-full h-24 object-cover rounded" />
            </div>
          )}
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </a>
      </CardContent>
    </Card>
  )
}
