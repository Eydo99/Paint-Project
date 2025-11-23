package com.example.example1.Model;

import java.util.HashMap;
import java.util.Map;

public class Square extends shape {
    private double sideLength;

    @Override
    public void setProperties(Map<String, Object> props) {
        this.x=((Number)props.get("x")).doubleValue();
        this.y=((Number)props.get("y")).doubleValue();
        this.centerX=((Number)props.get("centerX")).doubleValue();
        this.centerY=((Number)props.get("centerY")).doubleValue();
        this.sideLength=calculateSideLength(this.x,this.centerX);
        this.angle=0;
    }

    @Override
    public Map<String, Object> getProperties() {
        Map<String,Object> props=new HashMap<>();
        props.put("x",this.x);
        props.put("y",this.y);
        props.put("centerX",this.centerX);
        props.put("centerY",this.centerY);
        props.put("sideLength",this.sideLength);
        props.put("angle",this.angle);
        return props;
    }

    public void setSideLength(double sideLength) {
        this.sideLength = sideLength;
    }

    public double calculateSideLength(double x, double centerX) {
        return 2*Math.abs(x-centerX);
    }

}
