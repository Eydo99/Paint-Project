package com.example.example1.shapeService;

import com.example.example1.Commands.Command;
import com.example.example1.Commands.moveCommand;
import com.example.example1.Commands.resizeCommand;
import com.example.example1.DTO.moveDTO;
import com.example.example1.DTO.resizeDTO;
import com.example.example1.DTO.shapeDTO;
import com.example.example1.Model.shape;
import com.example.example1.Factory.shapeFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Stack;

@Service
public class shapeService {

    List<shape> shapes=new ArrayList<>();
    shapeFactory shapeFactory=new shapeFactory();
    Stack<Command> undoStack=new Stack<>();
    Stack<Command> redoStack=new Stack<>();
    private int nextID=1;


    public shape createShape(shapeDTO DTO)
    {
        shape newShape =shapeFactory.createShape(DTO.getType());
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
        return shapes.stream().filter(shape ->  shape.getId().equals(String.valueOf(id))).findFirst().orElseThrow(()->new RuntimeException("Shape not found"));
    }

    public shape getShape(int id) {
        return getShapeById(id);
    }

    public shape copyShape(int id) {
        shape originalShape=getShapeById(id);
        shape clone=originalShape.clone();
<<<<<<< HEAD
        clone.setId(nextID++);
=======
        clone.setId(String.valueOf(nextID++));
>>>>>>> 7a635d5fa7e0f7a12b1651ad7ca2ff1f5c451416
        shapes.add(clone);
        return clone;
    }

    public void moveShape(moveDTO dto) {
        shape shape=getShapeById(dto.getId());

        Command command=new moveCommand(shape, dto.getX(), dto.getY(), dto.getCenterX(), dto.getCenterY());
        command.execute();
        undoStack.push(command);
    }

    public void resizeShape(resizeDTO dto) {
        shape shape=getShapeById(dto.getId());

        Command command=new resizeCommand(shape, dto.getX(),dto.getY(),dto.getCenterX(),dto.getCenterY(),dto.getProperties());
        command.execute();
        undoStack.push(command);
    }

<<<<<<< HEAD
}
=======
}
>>>>>>> 7a635d5fa7e0f7a12b1651ad7ca2ff1f5c451416
