package com.example.example1.DTO;

import java.util.Map;

public class updateDTO {
    private String id;
    private double x;
    private double y;
    private double centerX;
    private double centerY;
    private double angle;
    private Map<String,Object> properties;

    public double getAngle() {
        return angle;
    }

    public void setAngle(double angle) {
        this.angle = angle;
    }

    public Map<String, Object> getProperties() {
        return properties;
    }

    public void setProperties(Map<String, Object> properties) {
        this.properties = properties;
    }

    public String getId() {
        return id;
    }

    public double getCenterY() {
        return centerY;
    }

    public void setCenterY(double centerY) {
        this.centerY = centerY;
    }

    public void setId(String id) {
        this.id = id;
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
}

/*
{
    "id":"2",
    "x": 21,
    "y": 45,
    "centerX":34,
    "centerY":76,
    "angle":55,
    "properties":
    {
        "length":55,
        "width":55
    }
}
 */