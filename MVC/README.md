# MVC - Abrigo de Animais (CLI)

Projeto Java simples com arquitetura MVC + DAO para gerenciamento de um abrigo de animais via terminal.

## Funcionalidades
- Cadastro de animal
- Listagem de animais
- Edicao de animal por ID
- Exclusao de animal por ID

## Como executar
1. Compile:
   ```powershell
   javac -d out src\Main.java src\controller\AbrigoController.java src\dao\AnimalDao.java src\dao\AnimalDaoMemoria.java src\model\Animal.java src\view\AbrigoView.java
   ```
2. Execute:
   ```powershell
   java -cp out Main
   ```
