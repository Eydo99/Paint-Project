package com.example.example1.Model;

import java.util.HashMap;
import java.util.Map;

public class Text extends shape {
    private String content,fontFamily,fontColor,fontWeight,fontStyle;
    private int fontSize;



    @Override
    public void setProperties(Map<String,Object> props)
    {
        this.content=((String)props.get("content"));
        this.fontFamily=((String)props.get("fontFamily"));
        this.fontColor=((String)props.get("fontColor"));
        this.fontWeight=((String)props.get("fontWeight"));
        this.fontStyle=((String)props.get("fontStyle"));
        this.fontSize=((Number)props.get("fontSize")).intValue();
    }

    public void setFontSize(int fontSize) {
        this.fontSize = fontSize;
    }

    public Map<String,Object> getProperties()
    {
        Map<String,Object> props = new HashMap<>();
        props.put("content",content);
        props.put("fontFamily",fontFamily);
        props.put("fontColor",fontColor);
        props.put("fontWeight",fontWeight);
        props.put("fontStyle",fontStyle);
        props.put("fontSize",fontSize);
        return props;
    }

    @Override
    public shape clone()
    {
        Text clone=(Text)super.clone();
        clone.content=content;
        clone.fontFamily=fontFamily;
        clone.fontColor=fontColor;
        clone.fontWeight=fontWeight;
        clone.fontStyle=fontStyle;
        clone.fontSize=fontSize;
        return clone;
    }

    @Override
    public void resize(double x,double y, double centerX,double centerY,Map<String,Object> props)
    {
        setX(x);
        setY(y);
        setCenterX(centerX);
        setCenterY(centerY);
        setFontSize(((Number)props.get("fontSize")).intValue());
    }
}

/*
{
    "type":"text",
    "properties": {
        "content": "A7a",
        "fontColor": "red",
        "fontFamily": "Roboto",
        "fontSize": 20,
        "fontStyle": "Italic",
        "fontWeight": "bold"
    },
    "x": 21,
    "y": 45,
    "centerX":34,
    "centerY":76
}
 */