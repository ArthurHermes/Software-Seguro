package controller;

import dao.AnimalDao;
import java.util.List;
import model.Animal;
import view.AbrigoView;

public class AbrigoController {
    private final AnimalDao animalDao;
    private final AbrigoView view;

    public AbrigoController(AnimalDao animalDao, AbrigoView view) {
        this.animalDao = animalDao;
        this.view = view;
    }

    public void iniciar() {
        boolean executando = true;

        while (executando) {
            int opcao = view.exibirMenuELerOpcao();

            switch (opcao) {
                case 1 -> cadastrarAnimal();
                case 2 -> listarAnimais();
                case 3 -> editarAnimal();
                case 4 -> excluirAnimal();
                case 0 -> {
                    executando = false;
                    view.exibirMensagem("Encerrando sistema do abrigo.");
                }
                default -> view.exibirMensagem("Opcao invalida.");
            }
        }
    }

    private void cadastrarAnimal() {
        String nome = view.lerTextoObrigatorio("Nome");
        String especie = view.lerTextoObrigatorio("Especie");
        int idade = view.lerInteiroPositivo("Idade");

        Animal animal = animalDao.cadastrar(nome, especie, idade);
        view.exibirMensagem("Animal cadastrado com sucesso. ID gerado: " + animal.getId());
    }

    private void listarAnimais() {
        List<Animal> animais = animalDao.listarTodos();
        view.exibirAnimais(animais);
    }

    private void editarAnimal() {
        int id = view.lerId();
        Animal animal = animalDao.buscarPorId(id);

        if (animal == null) {
            view.exibirMensagem("Animal nao encontrado para o ID informado.");
            return;
        }

        view.exibirMensagem("Editando: " + animal);

        String novoNome = view.lerTextoObrigatorio("Novo nome");
        String novaEspecie = view.lerTextoObrigatorio("Nova especie");
        int novaIdade = view.lerInteiroPositivo("Nova idade");

        boolean atualizado = animalDao.atualizar(id, novoNome, novaEspecie, novaIdade);

        if (atualizado) {
            view.exibirMensagem("Animal atualizado com sucesso.");
            return;
        }

        view.exibirMensagem("Animal nao encontrado para o ID informado.");
    }

    private void excluirAnimal() {
        int id = view.lerId();
        boolean excluido = animalDao.excluirPorId(id);

        if (excluido) {
            view.exibirMensagem("Animal excluido com sucesso.");
            return;
        }

        view.exibirMensagem("Animal nao encontrado para o ID informado.");
    }
}
