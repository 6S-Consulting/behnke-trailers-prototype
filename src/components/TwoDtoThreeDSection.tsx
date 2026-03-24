import { useState } from "react"
import { Upload, ArrowRight, ArrowLeft, RotateCcw, Save, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import TrailerViewer from "../trailers/old/DirectionalDrillTrailer"

export default function TwoDtoThreeDSection() {
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<'upload' | 'options' | 'view'>('upload')
  const [useCase, setUseCase] = useState<string>("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleGenerate = () => {
    setStep('options')
  }

  return (
    <section className="py-24 bg-background px-6 min-h-screen flex flex-col">
      <div className="max-w-4xl mx-auto flex flex-col flex-1 w-full">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-bold tracking-tight mb-4 text-foreground">
            Visualize Your Design <span className="text-primary">Instantly</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Upload your 2D diagram, schematic, or sketch, and our AI-powered engine will generate a comprehensive 3D layout for your review.
          </p>
        </div>

        {step === 'upload' && (
          <div className="w-full">
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

                <Button
                  className="w-full h-12 text-lg font-semibold shadow-lg"
                  size="lg"
                  onClick={handleGenerate}
                  disabled={!file}
                >
                  Generate 3D Layout <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'options' && (
          <div className="w-full flex flex-col min-h-[600px]">
            <div className="flex items-center gap-2 mb-12">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep('upload')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <h3 className="text-3xl font-bold mb-12 text-foreground">What's the primary use case for this trailer?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <button
                  onClick={() => setStep('view')}
                  className="flex flex-col items-start p-8 rounded-2xl border-2 border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left group/btn shadow-sm hover:shadow-md bg-card"
                >
                  <h4 className="text-xl font-semibold mb-2 text-foreground">Flatbed Hauling</h4>
                  <p className="text-muted-foreground">
                    General purpose flatbed for standard cargo and equipment transport.
                  </p>
                </button>

                <button
                  onClick={() => setStep('view')}
                  className="flex flex-col items-start p-8 rounded-2xl border-2 border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left group/btn shadow-sm hover:shadow-md bg-card"
                >
                  <h4 className="text-xl font-semibold mb-2 text-foreground">Equipment Transport</h4>
                  <p className="text-muted-foreground">
                    Heavy equipment and machinery transport with reinforced specifications.
                  </p>
                </button>

                <button
                  onClick={() => setStep('view')}
                  className="flex flex-col items-start p-8 rounded-2xl border-2 border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left group/btn shadow-sm hover:shadow-md bg-card"
                >
                  <h4 className="text-xl font-semibold mb-2 text-foreground">Utility / General Purpose</h4>
                  <p className="text-muted-foreground">
                    Versatile trailer for mixed cargo and general hauling needs.
                  </p>
                </button>

                <button
                  onClick={() => setStep('view')}
                  className="flex flex-col items-start p-8 rounded-2xl border-2 border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left group/btn shadow-sm hover:shadow-md bg-card"
                >
                  <h4 className="text-xl font-semibold mb-2 text-foreground">Specialized Transport</h4>
                  <p className="text-muted-foreground">
                    Custom configurations for specialized cargo requirements.
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'view' && (
          <Card className="h-full flex flex-col min-h-[700px] overflow-hidden border shadow-sm flex-1">
            <Tabs defaultValue="3d-view" className="w-full h-full flex flex-col">
              <div className="border-b px-6 py-3 bg-muted/30 flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStep('options')}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button variant="outline" size="icon" title="Reset View">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button variant="default" size="sm">
                    <Save className="w-4 h-4 mr-2" /> Save Draft
                  </Button>
                </div>
              </div>

              <TabsContent value="3d-view" className="flex-1 p-0 m-0 relative bg-slate-900 group">
                <div className="w-full h-full absolute inset-0">
                  <TrailerViewer key="3d-model" className="w-full h-full border-0 rounded-none bg-slate-900" />
                </div>

                {/* Overlay Controls */}
                <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
                  <Button variant="secondary" size="sm" className="bg-white/10 backdrop-blur text-white hover:bg-white/20 border-white/10">
                    + Zoom In
                  </Button>
                  <Button variant="secondary" size="sm" className="bg-white/10 backdrop-blur text-white hover:bg-white/20 border-white/10">
                    - Zoom Out
                  </Button>
                </div>
              </TabsContent>


            </Tabs>
          </Card>
        )}

      </div>
    </section>
  )
}
