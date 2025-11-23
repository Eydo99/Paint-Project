package com.example.example1.Model;

import java.util.HashMap;
import java.util.Map;

public class Triangle extends shape {
    private double base,height;

    @Override
    public void setProperties(Map<String, Object> props)
    {
        this.x=((Number)props.get("x")).doubleValue();
        this.y=((Number)props.get("y")).doubleValue();
        this.centerX=((Number)props.get("centerX")).doubleValue();
        this.centerY=((Number)props.get("centerY")).doubleValue();
        this.base=calculateBase(this.x,this.centerX);
        this.height=calculateHeight(this.y,this.centerY );
        this.angle=0;
    }

    public Map<String,Object> getProperties()
    {
        Map<String,Object> props=new HashMap<>();
        props.put("x",this.x);
        props.put("y",this.y);
        props.put("centerX",this.centerX);
        props.put("centerY",this.centerY);
        props.put("base",this.base);
        props.put("height",this.height);
        props.put("angle",this.angle);
        return props;
    }

    private double calculateBase(double x,double centerX) {
        return 2*Math.abs(x-centerX);
    }

    private double calculateHeight(double y,double centery) {
        return 2*Math.abs(y-centery);
    }
}
