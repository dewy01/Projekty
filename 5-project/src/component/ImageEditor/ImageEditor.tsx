import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputLabel,
  Slider,
  Toolbar,
  Typography,
} from "@mui/material"
import React, { useEffect, useRef, useState } from "react"
import { CanvasHandler } from "./CanvasHandler"
import { FileHandler } from "./FileHandler"

export const ImageEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [canvasHandler, setCanvasHandler] = useState<CanvasHandler | null>(null)
  const [fileHandler, setFileHandler] = useState<FileHandler | null>(null)
  const [fileKey, setFileKey] = useState(0)
  const [quality, setQuality] = useState(90)
  const [dialog, setDialog] = useState<"histogram" | "binarization" | null>(
    null
  )
  const [threshold, setThreshold] = useState<number>(128)
  const [percentThreshold, setPercentThreshold] = useState<number>(30)

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

  const handleBinarization = () => {
    if (canvasHandler) {
      canvasHandler?.applyManualThreshold(threshold)
      setDialog(null)
    }
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
            color="info"
            variant="contained"
            onClick={() => setDialog("histogram")}
            sx={{ marginRight: 2 }}
          >
            Histogram
          </Button>
          <Button
            color="info"
            variant="contained"
            onClick={() => setDialog("binarization")}
          >
            Binarization
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
      {dialog === "histogram" && (
        <Dialog open={true} onClose={() => setDialog(null)}>
          <DialogTitle>Histogram</DialogTitle>
          <DialogContent>
            <Typography>Select an option:</Typography>
            <Box gap={4} display={"flex"}>
              <Button
                variant="contained"
                onClick={() => {
                  canvasHandler?.applyHistogramStretch()
                  setDialog(null)
                }}
                sx={{ marginY: 1 }}
              >
                Histogram Stretching
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  canvasHandler?.applyHistogramEqualization()
                  setDialog(null)
                }}
              >
                Histogram Equalization
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialog(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
      {dialog === "binarization" && (
        <Dialog open={true} onClose={() => setDialog(null)}>
          <DialogTitle>Binarization</DialogTitle>
          <DialogContent>
            <Typography>Manual threshold setting:</Typography>
            <Typography sx={{ color: "white" }}>
              Threshold value: {threshold}
            </Typography>
            <Slider
              value={threshold}
              min={0}
              max={255}
              step={1}
              onChange={(_, value) => setThreshold(value as number)}
              sx={{ marginY: 2 }}
            />
            <Typography sx={{ color: "white" }}>
              Percent threshold: {percentThreshold}%
            </Typography>
            <Slider
              value={percentThreshold}
              min={0}
              max={100}
              step={1}
              onChange={(_, value) => setPercentThreshold(value as number)}
              sx={{ marginY: 2 }}
            />
            <Box gap={4} display={"flex"}>
              <Button
                variant="contained"
                onClick={handleBinarization}
                sx={{ marginY: 1 }}
              >
                Set threshold ({threshold})
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  canvasHandler?.applyPercentBlack(percentThreshold)
                  setDialog(null)
                }}
                sx={{ marginY: 1 }}
              >
                Percent Black Selection ({percentThreshold}%)
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  canvasHandler?.applyIterativeSelection()
                  setDialog(null)
                }}
              >
                Mean Iterative Selection
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialog(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  )
}
