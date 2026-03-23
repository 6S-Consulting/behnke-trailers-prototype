"use client"

import { useState } from "react"
import { Upload, ArrowRight, RotateCcw, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TwoDtoThreeDSection() {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  return (
    <section className="py-24 bg-background px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-bold tracking-tight mb-4 text-foreground">
            Visualize Your Design <span className="text-primary">Instantly</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Upload your 2D diagram, schematic, or sketch, and our AI-powered engine will generate a comprehensive 3D layout for your review.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Upload Column */}
          <Card className="border-2 border-dashed shadow-sm">
            <CardHeader>
              <CardTitle>Upload 2D Diagram</CardTitle>
              <CardDescription>
                Drag and drop your CAD file, PDF, or image here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                <Input 
                  type="file" 
                  className="hidden" 
                  id="file-upload" 
                  onChange={handleFileChange}
                />
                <Label 
                  htmlFor="file-upload" 
                  className="flex flex-col items-center cursor-pointer w-full h-full justify-center"
                >
                  <div className="bg-primary/10 p-4 rounded-full mb-4 text-primary">
                    <Upload className="w-8 h-8" />
                  </div>
                  <span className="text-lg font-medium text-foreground">
                    {file ? file.name : "Select or drop file"}
                  </span>
                  <span className="text-sm text-muted-foreground mt-2">
                    Supports .DXF, .DWG, .PDF, .PNG
                  </span>
                </Label>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">Width (ft)</Label>
                    <Input id="width" placeholder="e.g. 102" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="length">Length (ft)</Label>
                    <Input id="length" placeholder="e.g. 53" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Trailer Type</Label>
                  <Input id="type" placeholder="Select type..." />
                </div>
              </div>

              <Button className="w-full h-12 text-lg font-semibold shadow-lg" size="lg">
                Generate 3D Layout <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>

          {/* 3D Visualization Column */}
          <Card className="h-full border shadow-sm flex flex-col min-h-[600px] overflow-hidden">
            <Tabs defaultValue="3d-view" className="w-full h-full flex flex-col">
              <div className="border-b px-6 py-3 bg-muted/30 flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="3d-view">3D Layout</TabsTrigger>
                  <TabsTrigger value="schematic">Schematic</TabsTrigger>
                  <TabsTrigger value="specs">Specs</TabsTrigger>
                </TabsList>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" title="Reset View">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button variant="default" size="sm">
                    <Save className="w-4 h-4 mr-2" /> Save Draft
                  </Button>
                </div>
              </div>

              <TabsContent value="3d-view" className="flex-1 p-0 m-0 relative bg-slate-900 group">
                {/* 3D Viewer Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4 opacity-50 group-hover:opacity-100 transition-opacity">
                    <div className="w-24 h-24 border-4 border-slate-700 rounded-full border-t-primary animate-spin mx-auto" style={{ animationDuration: "3s" }}></div>
                    <p className="text-slate-400 font-mono text-sm">AWAITING INPUT...</p>
                  </div>
                  
                  {/* Grid Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                </div>
                
                {/* Overlay Controls */}
                <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                  <Button variant="secondary" size="sm" className="bg-white/10 backdrop-blur text-white hover:bg-white/20 border-white/10">
                    + Zoom In
                  </Button>
                  <Button variant="secondary" size="sm" className="bg-white/10 backdrop-blur text-white hover:bg-white/20 border-white/10">
                    - Zoom Out
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="schematic" className="flex-1 flex items-center justify-center bg-white m-0">
                <p className="text-muted-foreground">Schematic View Placeholder</p>
              </TabsContent>
              
              <TabsContent value="specs" className="flex-1 p-6 m-0 bg-background">
                <h3 className="text-lg font-semibold mb-4">Generated Specifications</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Est. Weight</span>
                    <span className="font-mono">--- lbs</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Material</span>
                    <span className="font-mono">Reviewing...</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Est. Cost</span>
                    <span className="font-mono">$---.--</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </section>
  )
}
