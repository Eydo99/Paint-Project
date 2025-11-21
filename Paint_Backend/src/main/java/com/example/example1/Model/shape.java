package com.example.example1.Model;

import java.util.Map;

public abstract class shape {
    protected String type;
    protected int id;
    protected double x;
    protected double y;
    protected String fillcolor;
    protected String outlineColor;
    protected int strokeWidth;

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

    public abstract void setprops(Map<String, Double> props);

    public String getFillcolor() {
        return fillcolor;
    }

    public void setFillcolor(String fillcolor) {
        this.fillcolor = fillcolor;
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
