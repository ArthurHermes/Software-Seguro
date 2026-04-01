package repository;

import model.Animal;

import java.util.ArrayList;
import java.util.List;

public class AbrigoRepository {
    private final List<Animal> animais = new ArrayList<>();
    private int proximoId = 1;

    public Animal cadastrar(String nome, String especie, int idade) {
        Animal animal = new Animal(proximoId++, nome, especie, idade);
        animais.add(animal);
        return animal;
    }

    public List<Animal> listarTodos() {
        return new ArrayList<>(animais);
    }

    public Animal buscarPorId(int id) {
        for (Animal animal : animais) {
            if (animal.getId() == id) {
                return animal;
            }
        }
        return null;
    }

    public boolean excluirPorId(int id) {
        Animal animal = buscarPorId(id);
        if (animal == null) {
            return false;
        }
        return animais.remove(animal);
    }
}
