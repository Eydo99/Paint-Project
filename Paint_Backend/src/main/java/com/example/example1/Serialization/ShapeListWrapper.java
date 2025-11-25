package com.example.example1.Serialization;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

import com.example.example1.Model.shape;

import java.util.List;

@XmlRootElement(name = "shapes")
public class ShapeListWrapper {

    private List<shape> shapes;

    public ShapeListWrapper() {}

    public ShapeListWrapper(List<shape> shapes) {
        this.shapes = shapes;
    }

    @XmlElement(name = "shape")
    public List<shape> getShapes() { return shapes; }

    public void setShapes(List<shape> shapes) { this.shapes = shapes; }
}
