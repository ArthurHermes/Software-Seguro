package view;

import model.Animal;

import java.util.List;
import java.util.Scanner;

public class AbrigoView {
    private final Scanner scanner = new Scanner(System.in);

    public int exibirMenuELerOpcao() {
        System.out.println("\n===== ABRIGO DE ANIMAIS =====");
        System.out.println("1 - Cadastrar animal");
        System.out.println("2 - Listar animais");
        System.out.println("3 - Editar animal");
        System.out.println("4 - Excluir animal");
        System.out.println("0 - Sair");
        System.out.print("Escolha uma opcao: ");
        return lerInteiro();
    }

    public String lerTextoObrigatorio(String campo) {
        while (true) {
            System.out.print(campo + ": ");
            String valor = scanner.nextLine().trim();
            if (!valor.isEmpty()) {
                return valor;
            }
            System.out.println("Valor invalido. Tente novamente.");
        }
    }

    public int lerInteiroPositivo(String campo) {
        while (true) {
            System.out.print(campo + ": ");
            int valor = lerInteiro();
            if (valor >= 0) {
                return valor;
            }
            System.out.println("Digite um numero inteiro maior ou igual a zero.");
        }
    }

    public int lerId() {
        System.out.print("Informe o ID do animal: ");
        return lerInteiro();
    }

    public void exibirMensagem(String mensagem) {
        System.out.println(mensagem);
    }

    public void exibirAnimais(List<Animal> animais) {
        if (animais.isEmpty()) {
            System.out.println("Nenhum animal cadastrado.");
            return;
        }

        System.out.println("\n--- Lista de Animais ---");
        for (Animal animal : animais) {
            System.out.println(animal);
        }
    }

    private int lerInteiro() {
        while (true) {
            String entrada = scanner.nextLine().trim();
            try {
                return Integer.parseInt(entrada);
            } catch (NumberFormatException e) {
                System.out.print("Entrada invalida. Digite um numero inteiro: ");
            }
        }
    }
}
