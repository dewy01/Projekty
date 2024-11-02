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

const filters = {
  smoothing: [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ],
  median: null, // Special handling
  edgeDetectionX: [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ],
  edgeDetectionY: [
    [1, 2, 1],
    [0, 0, 0],
    [-1, -2, -1],
  ],
  highPass: [
    [-1, -1, -1],
    [-1, 9, -1],
    [-1, -1, -1],
  ],
  gaussian: [
    [1, 2, 1],
    [2, 4, 2],
    [1, 2, 1],
  ],
}

type FilterKeys = keyof typeof filters

export const ImageEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [canvasHandler, setCanvasHandler] = useState<CanvasHandler | null>(null)
  const [fileHandler, setFileHandler] = useState<FileHandler | null>(null)
  const [quality, setQuality] = useState(90)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [operation, setOperation] = useState("")
  const [sliderValues, setSliderValues] = useState([0, 0, 0])
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<FilterKeys | "">("")

  const handleOpenFilterDialog = () => {
    setFilterDialogOpen(true)
  }

  const handleApplyFilter = () => {
    if (canvasHandler && selectedFilter) {
      if (selectedFilter === "median") {
        canvasHandler.applyMedianFilter()
      } else if (["smoothing", "gaussian"].includes(selectedFilter)) {
        canvasHandler.applySmoothingOrGaussianFilter(filters[selectedFilter])
      } else {
        canvasHandler.applyEdgeDetectionFilter(filters[selectedFilter])
      }
      setFilterDialogOpen(false)
      setSelectedFilter("")
    }
  }

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
    }
  }

  const handleQualityChange = (event: Event, newValue: number | number[]) => {
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

  const handleOpenDialog = (operation: string) => {
    setOperation(operation)
    setSliderValues([0, 0, 0])
    setDialogOpen(true)
  }

  const handleApplyOperation = () => {
    if (canvasHandler) {
      const [r, g, b] = sliderValues.map((value) =>
        Math.max(0, Math.min(value, 255))
      )
      switch (operation) {
        case "add":
          canvasHandler.pointTransform((pixel) => ({
            r: Math.min(pixel.r + r, 255),
            g: Math.min(pixel.g + g, 255),
            b: Math.min(pixel.b + b, 255),
            a: pixel.a,
          }))
          break
        case "subtract":
          canvasHandler.pointTransform((pixel) => ({
            r: Math.max(pixel.r - r, 0),
            g: Math.max(pixel.g - g, 0),
            b: Math.max(pixel.b - b, 0),
            a: pixel.a,
          }))
          break
        case "multiply":
          canvasHandler.pointTransform((pixel) => ({
            r: Math.min((pixel.r * r) / 255, 255),
            g: Math.min((pixel.g * g) / 255, 255),
            b: Math.min((pixel.b * b) / 255, 255),
            a: pixel.a,
          }))
          break
        case "divide":
          canvasHandler.pointTransform((pixel) => ({
            r: pixel.r > 0 ? Math.min((pixel.r * 255) / r, 255) : 0,
            g: pixel.g > 0 ? Math.min((pixel.g * 255) / g, 255) : 0,
            b: pixel.b > 0 ? Math.min((pixel.b * 255) / b, 255) : 0,
            a: pixel.a,
          }))
          break
        case "brightness": {
          const brightnessValue = sliderValues[0]
          canvasHandler.pointTransform((pixel) => ({
            r: Math.min(Math.max(pixel.r + brightnessValue, 0), 255),
            g: Math.min(Math.max(pixel.g + brightnessValue, 0), 255),
            b: Math.min(Math.max(pixel.b + brightnessValue, 0), 255),
            a: pixel.a,
          }))
          break
        }

        case "gray":
          canvasHandler.pointTransform((pixel) => {
            const gray = Math.round((pixel.r + pixel.g + pixel.b) / 3)
            return { r: gray, g: gray, b: gray, a: pixel.a }
          })
          break
        case "gray-luminosity":
          canvasHandler.pointTransform((pixel) => {
            const gray = Math.round(
              pixel.r * 0.21 + pixel.g * 0.72 + pixel.b * 0.07
            )
            return { r: gray, g: gray, b: gray, a: pixel.a }
          })
          break
      }
      setDialogOpen(false)
    }
  }

  const handleSliderChange = (index: number, value: number) => {
    const newValues = [...sliderValues]
    newValues[index] = value
    setSliderValues(newValues)
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
          <Button color="inherit" onClick={() => handleOpenDialog("add")}>
            Add
          </Button>
          <Button color="inherit" onClick={() => handleOpenDialog("subtract")}>
            Subtract
          </Button>
          <Button color="inherit" onClick={() => handleOpenDialog("multiply")}>
            Multiply
          </Button>
          <Button color="inherit" onClick={() => handleOpenDialog("divide")}>
            Divide
          </Button>
          <Button
            color="inherit"
            onClick={() => handleOpenDialog("brightness")}
          >
            Change Brightness
          </Button>
          <Button color="inherit" onClick={() => handleOpenDialog("gray")}>
            Grayscale (Average)
          </Button>
          <Button
            color="inherit"
            onClick={() => handleOpenDialog("gray-luminosity")}
          >
            Grayscale (Luminosity)
          </Button>
          <Button color="inherit" onClick={() => handleOpenFilterDialog()}>
            Apply Filter
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

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>
            {operation.charAt(0).toUpperCase() + operation.slice(1)}
          </DialogTitle>
          <DialogContent>
            {operation === "add" && (
              <>
                <Typography>Add RGB Values:</Typography>
                {sliderValues.map((value, index) => (
                  <Slider
                    key={index}
                    value={value}
                    min={0}
                    max={255}
                    onChange={(e, val) =>
                      handleSliderChange(index, val as number)
                    }
                    valueLabelDisplay="auto"
                    aria-labelledby={`slider-${index}`}
                  />
                ))}
              </>
            )}
            {operation === "subtract" && (
              <>
                <Typography>Subtract RGB Values:</Typography>
                {sliderValues.map((value, index) => (
                  <Slider
                    key={index}
                    value={value}
                    min={0}
                    max={255}
                    onChange={(e, val) =>
                      handleSliderChange(index, val as number)
                    }
                    valueLabelDisplay="auto"
                    aria-labelledby={`slider-${index}`}
                  />
                ))}
              </>
            )}
            {operation === "multiply" && (
              <>
                <Typography>Multiply RGB Values:</Typography>
                {sliderValues.map((value, index) => (
                  <Slider
                    key={index}
                    value={value}
                    min={0}
                    max={255}
                    onChange={(e, val) =>
                      handleSliderChange(index, val as number)
                    }
                    valueLabelDisplay="auto"
                    aria-labelledby={`slider-${index}`}
                  />
                ))}
              </>
            )}
            {operation === "divide" && (
              <>
                <Typography>Divide RGB Values:</Typography>
                {sliderValues.map((value, index) => (
                  <Slider
                    key={index}
                    value={value}
                    min={1}
                    max={255}
                    onChange={(e, val) =>
                      handleSliderChange(index, val as number)
                    }
                    valueLabelDisplay="auto"
                    aria-labelledby={`slider-${index}`}
                  />
                ))}
              </>
            )}
            {operation === "brightness" && (
              <>
                <Typography>Change Brightness:</Typography>
                <Slider
                  value={sliderValues[0]}
                  min={-255}
                  max={255}
                  onChange={(e, val) => handleSliderChange(0, val as number)}
                  valueLabelDisplay="auto"
                  aria-labelledby="brightness-slider"
                />
              </>
            )}
            {operation === "gray" && (
              <Typography>This operation does not require input.</Typography>
            )}
            {operation === "gray-luminosity" && (
              <Typography>This operation does not require input.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleApplyOperation} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={filterDialogOpen}
          onClose={() => setFilterDialogOpen(false)}
        >
          <DialogTitle>Select a Filter</DialogTitle>
          <DialogContent>
            {Object.keys(filters).map((filter) => (
              <Button
                key={filter}
                onClick={() => setSelectedFilter(filter as FilterKeys)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                handleApplyFilter()
                setFilterDialogOpen(false) // Close the dialog after applying
              }}
            >
              Apply
            </Button>
            <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  )
}
