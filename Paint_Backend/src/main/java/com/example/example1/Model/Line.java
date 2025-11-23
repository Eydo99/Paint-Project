package com.example.example1.Model;

import java.util.HashMap;
import java.util.Map;

public class Line extends shape {
    double xEnd,yEnd;

    @Override
    public void setProperties(Map<String,Object> props)
    {
        this.x=((Number)props.get("x")).doubleValue();
        this.y=((Number)props.get("y")).doubleValue();
        this.centerX=((Number)props.get("centerX")).doubleValue();
        this.centerY=((Number)props.get("centerY")).doubleValue();
        this.xEnd=calculateXEnd(this.x,this.centerX);
        this.yEnd=calcualteYEnd(this.y,this.centerY);
        this.angle=0;
    }

    @Override
    public Map<String,Object> getProperties() {
        Map<String,Object> props=new HashMap<>();
        props.put("x",this.x);
        props.put("y",this.y);
        props.put("centerX",this.centerX);
        props.put("centerY",this.centerY);
        props.put("xEnd",this.xEnd);
        props.put("yEnd",this.yEnd);
        props.put("angle",this.angle);
        return props;
    }

    private double calculateXEnd(double x,double centerX)
    {
        return Math.abs(2*centerX-x);
    }
    private double calcualteYEnd(double y,double centerY)
    {
        return Math.abs(2*centerY-y);
    }


}
