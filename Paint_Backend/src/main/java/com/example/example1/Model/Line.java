package com.example.example1.Model;

import java.util.HashMap;
import java.util.Map;

public class Line extends shape {
    double xEnd,yEnd,length;

    @Override
    public void setProperties(Map<String,Object> props)
    {
        this.xEnd=calculateXEnd(this.x,this.centerX);
        this.yEnd=calculateYEnd(this.y,this.centerY);
        this.length=calculateLength(this.x,this.y,this.centerX,this.centerY);
    }

    @Override
    public Map<String,Object> getProperties() {
        Map<String,Object> props=new HashMap<>();
        props.put("xEnd",this.xEnd);
        props.put("yEnd",this.yEnd);
        props.put("length",this.length);
        return props;
    }

    private double calculateXEnd(double x,double centerX)
    {
        return Math.abs(2*centerX-x);
    }

    private double calculateYEnd(double y,double centerY)
    {
        return Math.abs(2*centerY-y);
    }

    private double calculateLength(double x,double y,double centerX,double centerY)
    {
        return 2*Math.sqrt(Math.pow(x-centerX,2)+Math.pow(y-centerY,2));
    }

    public void setLength(double length) {
        this.length = length;
    }

    @Override
    public shape clone()
    {
        Line clone=(Line)super.clone();
        clone.xEnd=this.xEnd;
        clone.yEnd=this.yEnd;
        return clone;
    }


    @Override
    public void resize(double x,double y, double centerX,double centerY,Map<String,Object> props)
    {
        setCenterX(centerX);
        setCenterY(centerY);
        setX(x);
        setY(y);
        setLength((((Number)props.get("length")).doubleValue()));
    }


}

/*
{
    "type":"line",
    "fillColor": "green",
    "outlineColor": "red",
    "strokeWidth": 1,
    "x": 21,
    "y": 45,
    "centerX":34,
    "centerY":76
}
 */