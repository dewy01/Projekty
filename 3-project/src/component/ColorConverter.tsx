import React, { useState } from "react"
import { cmykToRgb, rgbToCmyk } from "../util/converter"

export const ColorConverter = () => {
  const [rgb, setRgb] = useState({ r: 0, g: 0, b: 0 })
  const [cmyk, setCmyk] = useState({ c: 0, m: 0, y: 0, k: 0 })

  const handleRgbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const newRgb = { ...rgb, [name]: Number(value) }
    setRgb(newRgb)
    setCmyk(rgbToCmyk(newRgb.r, newRgb.g, newRgb.b))
  }

  const handleCmykChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const newCmyk = { ...cmyk, [name]: Number(value) }
    setCmyk(newCmyk)
    setRgb(cmykToRgb(newCmyk.c, newCmyk.m, newCmyk.y, newCmyk.k))
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: "30px" }}>
        <div>
          <h3>RGB</h3>
          {["r", "g", "b"].map((color) => (
            <div key={color}>
              <label>{color.toUpperCase()}: </label>
              <input
                type="range"
                name={color}
                min="0"
                max="255"
                value={rgb[color as keyof typeof rgb]}
                onChange={handleRgbChange}
              />
              <input
                type="number"
                name={color}
                min="0"
                max="255"
                value={rgb[color as keyof typeof rgb]}
                onChange={handleRgbChange}
              />
            </div>
          ))}
        </div>

        <div>
          <h3>CMYK</h3>
          {["c", "m", "y", "k"].map((color) => (
            <div key={color}>
              <label>{color.toUpperCase()}: </label>
              <input
                type="range"
                name={color}
                min="0"
                max="100"
                value={cmyk[color as keyof typeof cmyk]}
                onChange={handleCmykChange}
              />
              <input
                type="number"
                name={color}
                min="0"
                max="100"
                value={cmyk[color as keyof typeof cmyk]}
                onChange={handleCmykChange}
              />
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h3>Color Preview</h3>
        <div
          style={{
            backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
            width: "200px",
            height: "200px",
            border: "1px solid black",
          }}
        />
      </div>
    </div>
  )
}
