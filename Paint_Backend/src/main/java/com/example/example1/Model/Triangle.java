package com.example.example1.Model;

import java.util.HashMap;
import java.util.Map;

public class Triangle extends shape {
    private double base,height;

    @Override
    public void setProperties(Map<String, Object> props)
    {
        this.base=calculateBase(this.x,this.centerX);
        this.height=calculateHeight(this.y,this.centerY );
    }

<<<<<<< HEAD
    public double getHeight() {
        return height;
    }
=======
>>>>>>> 7a635d5fa7e0f7a12b1651ad7ca2ff1f5c451416

    public void setHeight(double height) {
        this.height = height;
    }

<<<<<<< HEAD
    public double getBase() {
        return base;
    }

=======
>>>>>>> 7a635d5fa7e0f7a12b1651ad7ca2ff1f5c451416
    public void setBase(double base) {
        this.base = base;
    }

    public Map<String,Object> getProperties()
    {
        Map<String,Object> props=new HashMap<>();
        props.put("base",this.base);
        props.put("height",this.height);
        return props;
    }

    private double calculateBase(double x,double centerX) {
        return 2*Math.abs(x-centerX);
    }

    private double calculateHeight(double y,double centerY) {
        return 2*Math.abs(y-centerY);
    }


    @Override
    public shape clone() {
        Triangle clone=(Triangle)super.clone();
        clone.base=this.base;
        clone.height=this.height;
        return clone;
    }

    @Override
    public void resize(double x, double y, double centerX, double centerY, Map<String,Object> props)
    {
        setCenterX(centerX);
        setCenterY(centerY);
        setX(x);
        setY(y);
        setBase(((Number)props.get("base")).doubleValue());
        setHeight(((Number)props.get("height")).doubleValue());
    }
}

/*
{
    "type":"triangle",
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
=======
 */
>>>>>>> 7a635d5fa7e0f7a12b1651ad7ca2ff1f5c451416
