package dao;

import java.util.List;
import model.Animal;

public interface AnimalDao {
    Animal cadastrar(String nome, String especie, int idade);

    List<Animal> listarTodos();

    Animal buscarPorId(int id);

    boolean atualizar(int id, String nome, String especie, int idade);

    boolean excluirPorId(int id);
}
