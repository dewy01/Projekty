import React, { useEffect, useRef, useState } from "react"
import { CanvasHandler } from "./CanvasHandler"
import { FileHandler } from "./FileHandler"

export const ImageEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [canvasHandler, setCanvasHandler] = useState<CanvasHandler | null>(null)
  const [fileHandler, setFileHandler] = useState<FileHandler | null>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  const [quality, setQuality] = useState(90)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        const handler = new CanvasHandler(canvas, ctx)
        setCanvasHandler(handler)
        setFileHandler(new FileHandler(handler))
      }
    }
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && fileHandler) {
      fileHandler.handleFile(file)
    }
  }

  const handleClear = () => {
    if (canvasHandler) {
      canvasHandler.clearCanvas()
      setImage(null)
    }
  }

  const handleQualityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuality(Number(event.target.value))
  }

  const handleSaveJPEG = () => {
    if (canvasHandler && image) {
      const saveCanvas = document.createElement("canvas")
      saveCanvas.width = image.width
      saveCanvas.height = image.height
      const saveCtx = saveCanvas.getContext("2d")
      if (saveCtx) {
        saveCtx.drawImage(image, 0, 0)
        saveCanvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `${new Date().toISOString()}.jpeg`
              a.click()
              URL.revokeObjectURL(url)
            }
          },
          "image/jpeg",
          quality / 100
        )
      }
    }
  }

  const handleResizeFit = () => {
    canvasHandler?.resizeImageToFitCanvas()
  }

  return (
    <div className="main">
      <div className="sidebar">
        <div className="inputs">
          <label className="file-input-button" htmlFor="file-input">
            Import file
          </label>
          <input
            type="file"
            id="file-input"
            accept=".ppm,.jpeg,.jpg"
            onChange={handleFileChange}
          />
          <label htmlFor="quality">
            JPEG Quality: <span id="quality-label">{quality}</span>%
          </label>
          <input
            type="range"
            id="quality"
            min="1"
            max="100"
            value={quality}
            onChange={handleQualityChange}
          />
          <button onClick={handleSaveJPEG}>Save as JPEG</button>
          <button onClick={handleClear}>Clear</button>
          <button onClick={handleResizeFit}>Resize Fit</button>
        </div>
      </div>
      <div className="content">
        <div className="canvas-container">
          <canvas ref={canvasRef} id="canvas"></canvas>
        </div>
      </div>
      <div id="pixel-info"></div>
    </div>
  )
}
