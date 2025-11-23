package com.example.example1.Model;

import java.util.HashMap;
import java.util.Map;

public class Ellipse extends shape {
    private double radiusX,radiusY;

    @Override
    public void setProperties(Map<String, Object> props)
    {
        this.x=((Number)props.get("x")).doubleValue();
        this.y=((Number)props.get("y")).doubleValue();
        this.centerX=((Number)props.get("centerX")).doubleValue();
        this.centerY=((Number)props.get("centerY")).doubleValue();
        this.radiusX=calculateRadiusX(this.x,this.centerX);
        this.radiusY=calculateRadiusY(this.y,this.centerY);
        this.angle=0;

    }

    @Override
    public Map<String, Object> getProperties() {
        Map<String, Object> props = new HashMap<>();
        props.put("x",this.x);
        props.put("y",this.y);
        props.put("centerX",this.centerX);
        props.put("centerY",this.centerY);
        props.put("radiusX",this.radiusX);
        props.put("radiusY",this.radiusY);
        props.put("angle",this.angle);
        return props;
    }
/*
    public void setRadiusX(double radiusX) {
        this.radiusX = radiusX;
    }

    public void setRadiusY(double radiusY) {
        this.radiusY = radiusY;
    }

 */

    private double calculateRadiusX(double x, double CenterX)
    {
        return Math.abs(x-CenterX);
    }
    private double calculateRadiusY(double y,double CenterY)
    {
        return Math.abs(y-CenterY);
    }

}
