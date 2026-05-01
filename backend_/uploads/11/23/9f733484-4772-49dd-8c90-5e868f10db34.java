package com.sweety.Todo.Service;

import com.sweety.Todo.model.Todos;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TodosService {

    private final List<Todos> todosList = new ArrayList<>();
    private Long idCounter = 1L;

    public Todos add(Todos t) {
        t.setId(idCounter++);
        todosList.add(t);
        return t;
    }

    public List<Todos> getAll() {
        return todosList;
    }

    public Todos update(Long id, Todos updated) {
        for (Todos t : todosList) {
            if (t.getId().equals(id)) {
                t.setTitle(updated.getTitle());
                t.setCompleted(updated.isCompleted());
                return t;
            }
        }
        return null;
    }

    public boolean delete(Long id) {
        return todosList.removeIf(t -> t.getId().equals(id));
    }
}