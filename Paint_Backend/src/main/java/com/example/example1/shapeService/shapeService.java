package com.example.example1.shapeService;

import com.example.example1.Commands.*;
import com.example.example1.DTO.updateColorDTO;
import com.example.example1.DTO.shapeDTO;
import com.example.example1.DTO.updateDTO;
import com.example.example1.Model.shape;
import com.example.example1.Factory.shapeFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class shapeService {

    List<shape> shapes = new ArrayList<>();
    shapeFactory shapeFactory = new shapeFactory();
    commandManager commandManager = new commandManager();
    private int nextID = 1;


    public shape createShape(shapeDTO DTO) {
        shape newShape = shapeFactory.createShape(DTO.getType());
        newShape.setId(String.valueOf(nextID++));
        newShape.setType(DTO.getType());
        newShape.setX(DTO.getX());
        newShape.setY(DTO.getY());
        newShape.setCenterX(DTO.getCenterX());
        newShape.setCenterY(DTO.getCenterY());
        newShape.setProperties(DTO.getProperties());
        newShape.setFillColor(DTO.getFillColor());
        newShape.setOutlineColor(DTO.getOutlineColor());
        newShape.setStrokeWidth(DTO.getStrokeWidth());
        newShape.setAngle(0);

        commandManager.execute(new addCommand(this.shapes,newShape));

        return newShape;
    }


    public void deleteShape(int id) {
        shape shape = getShapeById(id);
        commandManager.execute(new deleteCommand(this.shapes, shape));
    }

    public void deleteAll()
    {
        commandManager.clear();
        shapes.clear();
        nextID = 1;
    }


    public List<shape> getShapes() {
        return shapes;
    }


    public shape getShape(int id) {
        return getShapeById(id);
    }

    public shape copyShape(int id) {
        shape originalShape = getShapeById(id);
        shape clone = originalShape.clone();
        clone.setId(String.valueOf(nextID++));
        commandManager.execute(new addCommand(this.shapes,clone));
        return clone;
    }


    public void updateShape(updateDTO dto) {
        shape shape = getShapeById(Integer.parseInt(dto.getId()));
        commandManager.execute(new updateCommand(shape, dto.getX(),dto.getY(),dto.getCenterX(),dto.getCenterY(),dto.getAngle(),dto.getProperties()));
    }

    public void updateColor(updateColorDTO dto) {
        shape shape = getShapeById(Integer.parseInt(dto.getId()));

        commandManager.execute(new updateColorCommand(shape,dto.getFillColor(), dto.getOutlineColor(),dto.getStrokeWidth()));
    }

    public shape undo()
    {
       return commandManager.undo();
    }
    public shape redo()
    {
       return commandManager.redo();
    }


    private shape getShapeById(int id) {
        return shapes.stream().filter(shape -> shape.getId().equals(String.valueOf(id))).findFirst().orElseThrow(() -> new RuntimeException("Shape not found"));
    }
}