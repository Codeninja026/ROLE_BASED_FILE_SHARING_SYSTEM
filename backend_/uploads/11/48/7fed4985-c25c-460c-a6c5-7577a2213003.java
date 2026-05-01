package com.example.Backendexample.service;

import com.example.Backendexample.model.Student;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class StudentService {

    private final List<Student> students = new ArrayList<>();
    private Long idCounter = 1L;

    // CREATE
    public Student create(Student s) {
        s.setId(idCounter++);
        students.add(s);
        return s;
    }

    // READ ALL
    public List<Student> getAll() {
        return students;
    }

    // READ ONE
    public Student getById(Long id) {
        return students.stream()
                .filter(s -> s.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    // UPDATE
    public Student update(Long id, Student updated) {
        for (Student s : students) {
            if (s.getId().equals(id)) {
                s.setName(updated.getName());
                s.setAge(updated.getAge());
                return s;
            }
        }
        return null;
    }

    // DELETE
    public boolean delete(Long id) {
        return students.removeIf(s -> s.getId().equals(id));
    }
}