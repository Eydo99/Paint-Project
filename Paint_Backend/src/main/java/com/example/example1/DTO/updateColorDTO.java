package com.example.example1.DTO;

public class updateColorDTO {
    private String id;
    private String fillColor;
    private String outlineColor;
    private int strokeWidth;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFillColor() {
        return fillColor;
    }

    public void setFillColor(String fillColor) {
        this.fillColor = fillColor;
    }

    public String getOutlineColor() {
        return outlineColor;
    }

    public void setOutlineColor(String outlineColor) {
        this.outlineColor = outlineColor;
    }

    public int getStrokeWidth() {
        return strokeWidth;
    }

    public void setStrokeWidth(int strokeWidth) {
        this.strokeWidth = strokeWidth;
    }
}