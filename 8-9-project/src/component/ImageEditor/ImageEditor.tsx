import {
  AppBar,
  Box,
  Button,
  InputLabel,
  Slider,
  Toolbar,
  Typography,
} from "@mui/material"
import React, { useEffect, useRef, useState } from "react"
import { CanvasHandler } from "./CanvasHandler"
import { FileHandler } from "./FileHandler"
import { HitOrMissDialog } from "./HitOrMissDialog"

export const ImageEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [canvasHandler, setCanvasHandler] = useState<CanvasHandler | null>(null)
  const [fileHandler, setFileHandler] = useState<FileHandler | null>(null)
  const [hitOrMissDialogOpen, setHitOrMissDialogOpen] = useState(false)
  const [fileKey, setFileKey] = useState(0)
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
      setFileKey((prevKey) => prevKey + 1)
      fileHandler.handleFile(file)
    }
  }

  const handleClear = () => {
    if (canvasHandler) {
      canvasHandler.clearCanvas()
    }
  }

  const handleQualityChange = (_: Event, newValue: number | number[]) => {
    setQuality(newValue as number)
  }

  const handleSaveJPEG = () => {
    if (canvasHandler) {
      const dataUrl = canvasHandler.getCurrentImageDataURL()
      const a = document.createElement("a")
      a.href = dataUrl
      a.download = "canvas-image.jpeg"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const handleResizeFit = () => {
    canvasHandler?.resizeImageToFitCanvas()
  }

  const handleHitOrMissApply = (structuringElement: (boolean | null)[][]) => {
    canvasHandler?.applyHitOrMiss(structuringElement)
    setHitOrMissDialogOpen(false)
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
      height="100%"
      sx={{
        backgroundColor: "#242424",
        color: "rgba(255, 255, 255, 0.87)",
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
      }}
    >
      <AppBar position="static">
        <Toolbar>
          <Button
            variant="contained"
            onClick={() => canvasHandler?.applyDilation()}
          >
            Dilation
          </Button>
          <Button
            variant="contained"
            onClick={() => canvasHandler?.applyErosion()}
          >
            Erosion
          </Button>
          <Button
            variant="contained"
            onClick={() => canvasHandler?.applyOpening()}
          >
            Opening
          </Button>
          <Button
            variant="contained"
            onClick={() => canvasHandler?.applyClosing()}
          >
            Closing
          </Button>
          <Button
            variant="contained"
            onClick={() => setHitOrMissDialogOpen(true)}
          >
            Hit-or-Miss
          </Button>
        </Toolbar>
      </AppBar>
      <Box display="flex">
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          justifyContent="center"
          alignItems="center"
          sx={{
            padding: 2,
            backgroundColor: "#1a1a1a",
            width: "30vw",
            flexShrink: 0,
          }}
        >
          <InputLabel htmlFor="file-input" sx={{ color: "white" }}>
            Import file
          </InputLabel>
          <input
            key={fileKey}
            type="file"
            id="file-input"
            accept=".ppm,.jpeg,.jpg"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <label htmlFor="file-input">
            <Button variant="contained" component="span" sx={{ width: "100%" }}>
              Choose File
            </Button>
          </label>
          <Typography sx={{ color: "white" }}>
            JPEG Quality: {quality}%
          </Typography>
          <Slider
            value={quality}
            min={1}
            max={100}
            onChange={handleQualityChange}
            sx={{
              width: "80%",
              color: "#fff",
            }}
          />
          <Button
            variant="contained"
            onClick={handleSaveJPEG}
            sx={{ width: "100%" }}
          >
            Save as JPEG
          </Button>
          <Button
            variant="contained"
            onClick={handleClear}
            sx={{ width: "100%" }}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            onClick={handleResizeFit}
            sx={{ width: "100%" }}
          >
            Resize Fit
          </Button>
        </Box>
        <Box
          flexGrow={1}
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          sx={{ padding: 2 }}
        >
          <Box
            sx={{
              width: "100%",
              maxHeight: "80vh",
              overflow: "hidden",
            }}
          >
            <canvas
              ref={canvasRef}
              id="canvas"
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "white",
                minWidth: "800px",
              }}
            ></canvas>
          </Box>
        </Box>
      </Box>
      <HitOrMissDialog
        open={hitOrMissDialogOpen}
        onClose={() => setHitOrMissDialogOpen(false)}
        onApply={handleHitOrMissApply}
      />
    </Box>
  )
}
