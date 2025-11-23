package com.example.example1.DTO;

import java.util.Map;

public class shapeDTO {

    private int id;
    private String type;
    private String fillColor;
    private String outlineColor;
    private int strokeWidth;
    private Map<String,Object> properties;
    private String content;
    private String fontFamily;
    private String fontColor;
    private String fontWeight;
    private String fontStyle;
    private int fontSize;

    public String getType() {
        return type;
    }

    public void setType(String type) {this.type = type;}
    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public String getFillColor() {
        return fillColor;
    }
    public void setFillColor(String fillColor) {
        this.fillColor = fillColor;
    }
    public String getOutlineColor() {
        return outlineColor;
    }
    public void setOutlineColor(String outlineColor) {
        this.outlineColor = outlineColor;
    }
    public int getStrokeWidth() {
        return strokeWidth;
    }
    public void setStrokeWidth(int strokeWidth) {
        this.strokeWidth = strokeWidth;
    }
    public void setProperties(Map<String,Object> properties) {
        this.properties = properties;
    }

    public Map<String, Object> getProperties() {
        return properties;
    }


}
