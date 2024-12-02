import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material"
import { useState } from "react"

interface HitOrMissDialogProps {
  open: boolean
  onClose: () => void
  onApply: (structuringElement: (boolean | null)[][]) => void
}

export const HitOrMissDialog: React.FC<HitOrMissDialogProps> = ({
  open,
  onClose,
  onApply,
}) => {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [matrix, setMatrix] = useState<(boolean | null)[][]>(
    Array(3)
      .fill(null)
      .map(() => Array(3).fill(null))
  )

  const handleApply = () => {
    onApply(matrix)
  }

  const handleMatrixChange = (
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    const updatedMatrix = matrix.map((row, r) =>
      row.map((cell, c) => {
        if (r === rowIndex && c === colIndex) {
          if (value.trim().toLowerCase() === "true") return true
          if (value.trim().toLowerCase() === "false") return false
          return null
        }
        return cell
      })
    )
    setMatrix(updatedMatrix)
  }

  const adjustMatrixSize = (newRows: number, newCols: number) => {
    const updatedMatrix = Array(newRows)
      .fill(null)
      .map((_, r) =>
        Array(newCols)
          .fill(null)
          .map((_, c) => (matrix[r]?.[c] !== undefined ? matrix[r][c] : null))
      )
    setRows(newRows)
    setCols(newCols)
    setMatrix(updatedMatrix)
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Define Structuring Element</DialogTitle>
      <DialogContent>
        <Typography sx={{ marginBottom: 2 }}>
          Use `true` for foreground, `false` for background, and `ignored` for
          neutral cells. Click on a cell to edit.
        </Typography>
        <Box
          display="flex"
          justifyContent="space-around"
          sx={{ marginBottom: 2 }}
        >
          <Button
            variant="outlined"
            onClick={() => adjustMatrixSize(rows + 1, cols + 1)}
          >
            Add
          </Button>
          <Button
            variant="outlined"
            onClick={() => adjustMatrixSize(rows - 1, cols - 1)}
            disabled={rows <= 1}
          >
            Remove
          </Button>
        </Box>
        <Box
          display="grid"
          gridTemplateColumns={`repeat(${cols}, 1fr)`}
          gap={1}
          sx={{
            marginBottom: 2,
          }}
        >
          {matrix.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <TextField
                key={`${rowIndex}-${colIndex}`}
                value={
                  cell === true ? "true" : cell === false ? "false" : "ignored"
                }
                onChange={(e) =>
                  handleMatrixChange(rowIndex, colIndex, e.target.value)
                }
                variant="outlined"
                size="small"
              />
            ))
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleApply}>Apply</Button>
      </DialogActions>
    </Dialog>
  )
}
