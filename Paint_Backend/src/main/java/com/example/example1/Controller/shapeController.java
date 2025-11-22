package com.example.example1.Controller;


import com.example.example1.DTO.shapeDTO;
import com.example.example1.Model.shape;
import com.example.example1.exceptions.ShapeNotFoundException;
import com.example.example1.exceptions.TypeNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.example1.shapeService.shapeService;

import java.util.List;


@RestController
@RequestMapping("/api/shape")
public class shapeController {

    @Autowired
    private shapeService shapeService;

    @PostMapping
    public shape addShape(@RequestBody shapeDTO dto) throws TypeNotFoundException  {
        return shapeService.createShape(dto);
    }

    @GetMapping
    public List<shape> getShapes() {
        return shapeService.getShapes();
    }

    @DeleteMapping("/delete/{id}")
    public void deleteShape(@PathVariable int id)throws ShapeNotFoundException {
        shapeService.delete(id);
    }
}
