package com.example.example1.shapeService;

import java.util.List;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.Marshaller;

import org.springframework.stereotype.Service;

import com.example.example1.Model.Circle;
import com.example.example1.Model.Ellipse;
import com.example.example1.Model.Line;
import com.example.example1.Model.Rectangle;
import com.example.example1.Model.Square;
import com.example.example1.Model.Triangle;
import com.example.example1.Model.shape;
import com.example.example1.Serialization.ShapeListWrapper;

import java.io.File;

@Service
public class XMLService {

    public void saveShapesToXML(List<shape> shapes, String filePath) throws Exception {

        ShapeListWrapper wrapper = new ShapeListWrapper(shapes);

                JAXBContext context = JAXBContext.newInstance(
            ShapeListWrapper.class,
            shape.class,
            Circle.class,      // ← ADD ALL THESE
            Rectangle.class,
            Square.class,
            Triangle.class,
            Ellipse.class,
            Line.class
        );
        Marshaller marshaller = context.createMarshaller();
        marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);

        marshaller.marshal(wrapper, new File(filePath));
    }
}
