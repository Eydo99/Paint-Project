package com.example.example1.shapeService;

import com.example.example1.DTO.shapeDTO;
import com.example.example1.Model.shape;
import com.example.example1.exceptions.ShapeNotFoundException;
import com.example.example1.exceptions.TypeNotFoundException;
import com.example.example1.Factory.shapeFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class shapeService {

    List<shape> shapes=new ArrayList<>();
    shapeFactory shapeFactory=new shapeFactory();
    private int nextID=1;


    public shape createShape(shapeDTO DTO) throws  TypeNotFoundException
    {
        shape newShape =shapeFactory.createShape(DTO.getType());
        newShape.setId(nextID++);
        newShape.setprops(DTO.getProperties());
        newShape.setFillcolor(DTO.getFillColor());
        newShape.setOutlineColor(DTO.getOutlineColor());
        newShape.setStrokeWidth(DTO.getStrokeWidth());
        newShape.setType(DTO.getType());
        shapes.add(newShape);
        return newShape;
    }

    public List<shape> getShapes() {
        return shapes;
    }


    public void delete(int id)throws ShapeNotFoundException {
        shape shape=getShapeById(id);
        shapes.remove(shape);
    }


    private shape getShapeById(int id) throws ShapeNotFoundException
    {
        return shapes.stream().filter(shape -> shape.getId()==id).findFirst().orElseThrow(()->new ShapeNotFoundException("Shape not found"));
    }
}
