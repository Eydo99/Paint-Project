package com.example.example1.Model;

import java.util.HashMap;
import java.util.Map;

public class Rectangle extends shape {

    private double length;
    private double width;

    @Override
    public void setProperties(Map<String,Object> props) {
        this.length = calculateLength(this.x,this.centerX);
        this.width = calculateWidth(this.y,this.centerY);
    }
    @Override
    public Map<String, Object> getProperties() {
        Map<String,Object> props=new HashMap<>();
        props.put("length",this.length);
        props.put("width",this.width);
        return props;
    }

    public void setLength(double length) {
        this.length = length;
    }


    public void setWidth(double width) {
        this.width = width;
    }


    private double calculateLength(double x,double centerX) {
        return 2*Math.abs(x-centerX);
    }
    private double calculateWidth(double y,double centerY) {
        return 2*Math.abs(y-centerY);
    }

    @Override
    public shape clone() {
        Rectangle clone=(Rectangle)super.clone();
        clone.length=this.length;
        clone.width=this.width;
        return clone;
    }

    @Override
    public void updateProperties( Map<String, Object> props)
    {
        setLength(((Number)props.get("length")).doubleValue());
        setWidth(((Number)props.get("width")).doubleValue());
    }
}

/*
{
    "type":"rectangle",
    "fillColor": "green",
    "outlineColor": "red",
    "strokeWidth": 1,
    "x": 21,
    "y": 45,
    "centerX":34,
    "centerY":76
}
 */
