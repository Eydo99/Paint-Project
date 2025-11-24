package com.example.example1.Model;

import java.util.Map;

public abstract class shape implements Cloneable {
    protected String type;
    protected String id;
    protected double x;
    protected double y;
    protected double centerX;
    protected double centerY;
    protected String fillColor;
    protected String outlineColor;
    protected int strokeWidth;
    protected double angle;

    public double getAngle() {
        return angle;
    }

    public void setAngle(double angle) {
        this.angle = angle;
    }

    public double getX() {
        return x;
    }

    public void setX(double x) {
        this.x = x;
    }

    public double getY() {
        return y;
    }

    public void setY(double y) {
        this.y = y;
    }

    public double getCenterY() {
        return centerY;
    }

    public void setCenterY(double centerY) {
        this.centerY = centerY;
    }

    public double getCenterX() {
        return centerX;
    }

    public void setCenterX(double centerX) {
        this.centerX = centerX;
    }


    public String getType() {
        return type;
    }

    public void setType(String name) {
        this.type = name;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
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

    @Override
    public shape clone() {
        try {
            return (shape) super.clone();
        } catch (CloneNotSupportedException e) {
            throw new RuntimeException("clone not supported");
        }
    }


    public abstract void update(double x, double y, double centerX, double centerY,double angle, Map<String, Object> props);

    public void upadteColor(String fillColor, String outlineColor,int strokeWidth) {
        setFillColor(fillColor);
        setOutlineColor(outlineColor);
        setStrokeWidth(strokeWidth);
    }
}