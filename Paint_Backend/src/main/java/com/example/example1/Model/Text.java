package com.example.example1.Model;

import java.util.HashMap;
import java.util.Map;

public class Text extends shape {
    private String content, fontFamily, fontStyle;
    private int fontSize;


    @Override
    public void setProperties(Map<String, Object> props) {
        this.content = ((String) props.get("content"));
        this.fontStyle = ((String) props.get("fontStyle"));
        this.fontSize = ((Number) props.get("fontSize")).intValue();
        this.fontFamily = ((String) props.get("fontFamily"));
    }


    public Map<String, Object> getProperties() {
        Map<String, Object> props = new HashMap<>();
        props.put("content", content);
        props.put("fontFamily", fontFamily);
        props.put("fontStyle", fontStyle);
        props.put("fontSize", fontSize);
        return props;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setFontStyle(String fontStyle) {
        this.fontStyle = fontStyle;
    }

    public void setFontFamily(String fontFamily) {
        this.fontFamily = fontFamily;
    }

    public void setFontSize(int fontSize) {
        this.fontSize = fontSize;
    }

    @Override
    public shape clone() {
        Text clone = (Text) super.clone();
        clone.content = content;
        clone.fontFamily = fontFamily;
        clone.fontStyle = fontStyle;
        clone.fontSize = fontSize;
        clone.x=this.x+10;
        clone.y=this.y+10;
        return clone;
    }

    @Override
    public void updateProperties(Map<String, Object> props) {
        setContent((String) props.get("content"));
        setFontStyle((String) props.get("fontStyle"));
        setFontFamily((String) props.get("fontFamily"));
        setFontSize(((Number) props.get("fontSize")).intValue());
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
