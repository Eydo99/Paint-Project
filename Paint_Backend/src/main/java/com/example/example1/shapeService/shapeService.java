package com.example.example1.shapeService;

import com.example.example1.DTO.shapeDTO;
import com.example.example1.Model.shape;
import com.example.example1.Factory.shapeFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class shapeService {

    List<shape> shapes=new ArrayList<>();
    shapeFactory shapeFactory=new shapeFactory();
    private int nextID=1;


    public shape createShape(shapeDTO DTO)
    {
        shape newShape =shapeFactory.createShape(DTO.getType());
        newShape.setId(nextID++);
        newShape.setType(DTO.getType());
        newShape.setProperties(DTO.getProperties());

        shapes.add(newShape);
        return newShape;
    }

    public List<shape> getShapes() {
        return shapes;
    }


    public void delete(int id) {
        shape shape=getShapeById(id);
        shapes.remove(shape);
    }


    private shape getShapeById(int id)
    {
        return shapes.stream().filter(shape -> shape.getId()==id).findFirst().orElseThrow(()->new RuntimeException("Shape not found"));
    }
}
