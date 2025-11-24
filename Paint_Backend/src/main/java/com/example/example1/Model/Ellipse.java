package com.example.example1.Model;

import java.util.HashMap;
import java.util.Map;

public class Ellipse extends shape {
    private double radiusX,radiusY;

    @Override
    public void setProperties(Map<String, Object> props)
    {
        this.radiusX=calculateRadiusX(this.x,this.centerX);
        this.radiusY=calculateRadiusY(this.y,this.centerY);
    }

    @Override
    public Map<String, Object> getProperties() {
        Map<String, Object> props = new HashMap<>();
        props.put("radiusX",this.radiusX);
        props.put("radiusY",this.radiusY);
        return props;
    }
    public void setRadiusX(double radiusX) {
        this.radiusX = radiusX;
    }

    public void setRadiusY(double radiusY) {
        this.radiusY = radiusY;
    }

    private double calculateRadiusX(double x, double CenterX)
    {
        return Math.abs(x-CenterX);
    }

    private double calculateRadiusY(double y,double CenterY)
    {
        return Math.abs(y-CenterY);
    }

    @Override
    public shape clone()
    {
        Ellipse clone=(Ellipse)super.clone();
        clone.radiusX=this.radiusX;
        clone.radiusY=this.radiusY;
        return clone;
    }

    @Override
    public void resize(double x,double y, double centerX,double centerY,Map<String,Object> props)
    {
        setCenterX(centerX);
        setCenterY(centerY);
        setX(x);
        setY(y);
        setRadiusX(((Number)props.get("radiusX")).doubleValue());
        setRadiusY(((Number)props.get("radiusY")).doubleValue());
    }

}

/*
{
    "type":"ellipse",
    "fillColor": "green",
    "outlineColor": "red",
    "strokeWidth": 1,
    "x": 21,
    "y": 45,
    "centerX":34,
    "centerY":76
}
 */