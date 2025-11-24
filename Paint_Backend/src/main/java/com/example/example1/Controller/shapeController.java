package com.example.example1.Controller;


import com.example.example1.DTO.shapeDTO;
import com.example.example1.DTO.updateColorDTO;
import com.example.example1.DTO.updateDTO;
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
    public shape addShape(@RequestBody shapeDTO dto) {
        return shapeService.createShape(dto);
    }

    @GetMapping
    public List<shape> getShapes() {
        return shapeService.getShapes();
    }

    @DeleteMapping("/delete/{id}")
    public void deleteShape(@PathVariable int id) {
        shapeService.delete(id);
    }

    @GetMapping("/{id}")
    public shape getShape(@PathVariable int id) {
        return shapeService.getShape(id);
    }

    @PostMapping("/copy/{id}")
    public shape copyShape(@PathVariable int id) {
        return shapeService.copyShape(id);
    }

    @PutMapping("/updateShape")
    public void updateShape(@RequestBody updateDTO dto) {
        shapeService.updateShape(dto);
    }

    @PutMapping("/updateColor")
    public void updateColor(@RequestBody updateColorDTO dto) {
        shapeService.updateColor(dto);
    }

}