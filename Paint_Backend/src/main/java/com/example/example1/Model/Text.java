package com.example.example1.Model;

import java.util.HashMap;
import java.util.Map;

public class Text extends shape {
    private String content,fontFamily,fontColor,fontWeight,fontStyle;
    private int fontSize;



    @Override
    public void setProperties(Map<String,Object> props)
    {
        this.x=((Number)props.get("x")).doubleValue();
        this.y=((Number)props.get("y")).doubleValue();
        this.centerX=((Number)props.get("centerX")).doubleValue();
        this.centerY=((Number)props.get("centerY")).doubleValue();
        this.content=((String)props.get("content"));
        this.fontFamily=((String)props.get("fontFamily"));
        this.fontColor=((String)props.get("fontColor"));
        this.fontWeight=((String)props.get("fontWeight"));
        this.fontStyle=((String)props.get("fontStyle"));
        this.fontSize=((Number)props.get("fontSize")).intValue();
        this.angle=(0);
    }


    public Map<String,Object> getProperties()
    {
        Map<String,Object> props = new HashMap<>();
        props.put("x",x);
        props.put("y",y);
        props.put("centerX",centerX);
        props.put("centerY",centerY);
        props.put("angle",angle);
        props.put("content",content);
        props.put("fontFamily",fontFamily);
        props.put("fontColor",fontColor);
        props.put("fontWeight",fontWeight);
        props.put("fontStyle",fontStyle);
        props.put("fontSize",fontSize);
        return props;
    }
}
