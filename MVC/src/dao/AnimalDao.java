package dao;

import java.util.List;
import model.Animal;

public interface AnimalDao {
    Animal cadastrar(String nome, String especie, int idade);

    List<Animal> listarTodos();

    Animal buscarPorId(int id);

    boolean excluirPorId(int id);
}
