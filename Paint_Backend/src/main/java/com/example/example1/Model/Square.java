package com.example.example1.Model;

import java.util.HashMap;
import java.util.Map;

public class Square extends shape {
    private double sideLength;

    @Override
    public void setProperties(Map<String, Object> props) {
        this.sideLength=calculateSideLength(this.x,this.centerX);
    }

    @Override
    public Map<String, Object> getProperties() {
        Map<String,Object> props=new HashMap<>();
        props.put("sideLength",this.sideLength);
        return props;
    }

    public void setSideLength(double sideLength) {
        this.sideLength = sideLength;
    }

    public double calculateSideLength(double x, double centerX) {
        return 2*Math.abs(x-centerX);
    }

    @Override
    public shape clone() {
        Square clone=(Square)super.clone();
        clone.sideLength=this.sideLength;
        return clone;
    }

    @Override
    public void resize(double x,double y, double centerX,double centerY,Map<String,Object> props) {
        setX(x);
        setY(y);
        setCenterX(centerX);
        setCenterY(centerY);
        setSideLength(((Number)props.get("sideLength")).doubleValue());
    }

}

/*
{
    "type":"square",
    "fillColor": "green",
    "outlineColor": "red",
    "strokeWidth": 1,
    "x": 21,
    "y": 45,
    "centerX":34,
    "centerY":76
}
 */
