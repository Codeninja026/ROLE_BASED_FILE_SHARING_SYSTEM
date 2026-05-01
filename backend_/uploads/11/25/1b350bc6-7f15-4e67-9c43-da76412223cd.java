package com.sweety.Todo.Controller;

import com.sweety.Todo.model.Todos;
import com.sweety.Todo.Service.TodosService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/todos")
public class TodosController {

    private final TodosService service;

    public TodosController(TodosService service) {
        this.service = service;
    }

    @PostMapping
    public Todos add(@RequestBody Todos t) {
        return service.add(t);
    }

    @GetMapping
    public List<Todos> getAll() {
        return service.getAll();
    }

    @PutMapping("/{id}")
    public Todos update(@PathVariable Long id, @RequestBody Todos t) {
        return service.update(id, t);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        return service.delete(id) ? "Deleted" : "Not Found";
    }
}