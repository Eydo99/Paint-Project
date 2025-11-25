package com.example.example1.DTO;

import java.util.Map;

public class shapeDTO {

    private String id;
    private String type;
    private String fillColor;
    private String outlineColor;
    private int strokeWidth;
    private Map<String,Object> properties;
    private double x;
    private double y;
    private double centerX;
    private double centerY;
    private double angle;


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

    public double getCenterX() {
        return centerX;
    }

    public void setCenterX(double centerX) {
        this.centerX = centerX;
    }

    public double getCenterY() {
        return centerY;
    }

    public void setCenterY(double centerY) {
        this.centerY = centerY;
    }
    public String getType() {
        return type;
    }

    public void setType(String type) {this.type = type;}

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
    public void setProperties(Map<String,Object> properties) {
        this.properties = properties;
    }

    public Map<String, Object> getProperties() {
        return properties;
    }


}