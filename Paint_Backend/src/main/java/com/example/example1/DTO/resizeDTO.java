package com.example.example1.DTO;

import java.util.Map;

public class resizeDTO {
    private int id;
    private double x;
    private double y;
    private double centerX;
    private double centerY;
    private Map<String,Object> properties;

    public int getId() {
        return id;
    }

    public void setId(int id) {
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

    public double getCenterY() {
        return centerY;
    }

    public void setCenterY(double centerY) {
        this.centerY = centerY;
    }

    public Map<String, Object> getProperties() {
        return properties;
    }

    public void setProperties(Map<String, Object> properties) {
        this.properties = properties;
    }
}

/*
{
    "id":5,
    "properties": {
        "radiusX":33,
        "radiusY":33
    },
    "x": 33,
    "y": 33,
    "centerX":33,
    "centerY":33
}
<<<<<<< HEAD
 */
=======
 */
>>>>>>> 7a635d5fa7e0f7a12b1651ad7ca2ff1f5c451416
