package com.example.example1.Model;

import java.util.HashMap;
import java.util.Map;

public class Circle extends shape {
    private double radius;

    @Override
    public void setProperties(Map<String, Object> props) {
        this.radius=calculateRadius(this.y,this.centerY);
    }

    @Override
    public Map<String, Object> getProperties() {
        Map<String,Object> props=new HashMap<>();
        props.put("radius",this.radius);
        return props;
    }

    public void setRadius(double radius) {
        this.radius = radius;
    }

    private double calculateRadius(double y,double centerY) {
        return Math.abs(y-centerY);
    }
    @Override
    public shape clone()
    {
        Circle clone=(Circle)super.clone();
        clone.radius=this.radius;
        return clone;
    }

    @Override
    public void updateProperties( Map<String, Object> props)
    {
        setRadius(((Number)props.get("radius")).doubleValue());
    }
}

/*
{
    "type":"circle",
    "fillColor": "green",
    "outlineColor": "red",
    "strokeWidth": 1,
    "x": 21,
    "y": 45,
    "centerX":34,
    "centerY":76
}
<<<<<<< HEAD
 */