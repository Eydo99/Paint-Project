package com.example.example1.Model;

import java.util.Map;

public abstract class shape {
    protected String type;
    protected int id;
    protected double x;
    protected double y;
    protected double centerX;
    protected double centerY;
    protected String fillColor;
    protected String outlineColor;
    protected int strokeWidth;
    protected double angle;

    public String getType() {
        return type;
    }

    public void setType(String name) {
        this.type = name;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public abstract void setProperties(Map<String, Object> props);

    public abstract Map<String, Object> getProperties();

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
