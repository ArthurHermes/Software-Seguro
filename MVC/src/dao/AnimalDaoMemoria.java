package dao;

import java.util.ArrayList;
import java.util.List;
import model.Animal;

public class AnimalDaoMemoria implements AnimalDao {
    private final List<Animal> animais = new ArrayList<>();
    private int proximoId = 1;

    @Override
    public Animal cadastrar(String nome, String especie, int idade) {
        Animal animal = new Animal(proximoId++, nome, especie, idade);
        animais.add(animal);
        return animal;
    }

    @Override
    public List<Animal> listarTodos() {
        return new ArrayList<>(animais);
    }

    @Override
    public Animal buscarPorId(int id) {
        for (Animal animal : animais) {
            if (animal.getId() == id) {
                return animal;
            }
        }
        return null;
    }

    @Override
    public boolean excluirPorId(int id) {
        Animal animal = buscarPorId(id);
        if (animal == null) {
            return false;
        }
        return animais.remove(animal);
    }
}
