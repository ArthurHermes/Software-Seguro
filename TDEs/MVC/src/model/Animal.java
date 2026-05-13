package model;

public class Animal {
    private final int id;
    private String nome;
    private String especie;
    private int idade;

    public Animal(int id, String nome, String especie, int idade) {
        this.id = id;
        this.nome = nome;
        this.especie = especie;
        this.idade = idade;
    }

    public int getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEspecie() {
        return especie;
    }

    public void setEspecie(String especie) {
        this.especie = especie;
    }

    public int getIdade() {
        return idade;
    }

    public void setIdade(int idade) {
        this.idade = idade;
    }

    @Override
    public String toString() {
        return String.format("ID: %d | Nome: %s | Especie: %s | Idade: %d", id, nome, especie, idade);
    }
}
