package com.example.Backendexample.controller;

import com.example.Backendexample.model.Student;
import com.example.Backendexample.service.StudentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/students")
public class StudentController {

    private final StudentService service;

    public StudentController(StudentService service) {
        this.service = service;
    }
    // CREATE
    @PostMapping
    public Student create(@RequestBody Student s) {
        return service.create(s);
    }

    // READ ALL
    @GetMapping
    public List<Student> getAll() {
        return service.getAll();
    }

    // READ ONE
    @GetMapping("/{id}")
    public Student getOne(@PathVariable Long id) {
        return service.getById(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Student update(@PathVariable Long id, @RequestBody Student s) {
        return service.update(id, s);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        return service.delete(id) ? "Deleted" : "Not Found";
    }
}