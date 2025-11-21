package com.example.example1.DTO;

import java.util.Map;

public class shapeDTO {

    private int id;
    private String type;
    private String fillColor;
    private String outlineColor;
    private int strokeWidth;
    private Map<String,Double> properties;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
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

    public Map<String, Double> getProperties() {
        return properties;
    }

    public void setProperties(Map<String, Double> properties) {
        this.properties = properties;
    }
}
