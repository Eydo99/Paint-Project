package com.example.example1.Controller;


import com.example.example1.DTO.fileDTO;
import com.example.example1.DTO.shapeDTO;
import com.example.example1.DTO.updateDTO;
import com.example.example1.Exceptions.IllegalShapeTypeException;
import com.example.example1.Exceptions.ShapeNotFoundException;
import com.example.example1.Exceptions.UndoRedoException;
import com.example.example1.Model.shape;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.example1.shapeService.shapeService;

import java.util.List;


@RestController
@RequestMapping("/api/shape")
@CrossOrigin(origins = "http://localhost:4200") // allow Angular frontend
public class shapeController {

    @Autowired
    private shapeService shapeService;

    @PostMapping
    public shape addShape(@RequestBody shapeDTO dto) throws IllegalShapeTypeException {
        return shapeService.createShape(dto);
    }
    
    @GetMapping
    public List<shape> getShapes() {
        return shapeService.getShapes();
    }

    @DeleteMapping("/delete/{id}")
    public void deleteShape(@PathVariable int id) throws ShapeNotFoundException {
        shapeService.deleteShape(id);
    }

    @DeleteMapping("/delete")
    public void deleteAllShapes() {
        shapeService.deleteAll();
    }

    @GetMapping("/{id}")
    public shape getShape(@PathVariable int id) throws ShapeNotFoundException {
        return shapeService.getShape(id);
    }

    @PostMapping("/copy/{id}")
    public shape copyShape(@PathVariable int id) throws ShapeNotFoundException {
        return shapeService.copyShape(id);
    }

    @PutMapping("/updateShape")
    public void updateShape(@RequestBody updateDTO dto) throws ShapeNotFoundException {
        shapeService.updateShape(dto);
    }


    @PostMapping("/undo")
    public shape undo() throws UndoRedoException {
       return  shapeService.undo();
    }

    @PostMapping("/redo")
    public shape redo() throws UndoRedoException {
       return  shapeService.redo();
    }

    @PostMapping("/save/xml")
    public void savefilexml(@RequestBody fileDTO dto) throws Exception  {
        shapeService.saveToXML(dto.getFullPath()+".xml") ;
    }
    @PostMapping("/save/json")
    public void savefilejson(@RequestBody fileDTO dto) throws Exception  {
        shapeService.saveToJSON(dto.getFullPath()+".json") ;
    }
}