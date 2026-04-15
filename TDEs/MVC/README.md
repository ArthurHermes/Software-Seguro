# MVC - Abrigo de Animais (CLI)

Projeto Java com arquitetura MVC + DAO usando JDBC (SQLite) para persistencia em arquivo.

## Funcionalidades
- Cadastro de animal
- Listagem de animais
- Edicao de animal por ID
- Exclusao de animal por ID

## Banco de dados
- Tipo: SQLite
- Arquivo local: `abrigo.db` (ao lado da pasta `out`, normalmente em `MVC\abrigo.db`)
- Tabela: `animais` (criada automaticamente)
- Ao iniciar o app, o caminho completo do banco e exibido no console (`Banco SQLite em uso: ...`).

## Dependencia JDBC
Baixe o driver SQLite JDBC e coloque em `MVC\lib\sqlite-jdbc.jar`.

## Como executar
1. Compile:
   ```powershell
   javac -cp "lib\sqlite-jdbc.jar" -d out src\Main.java src\controller\AbrigoController.java src\dao\AnimalDao.java src\dao\AnimalDaoJdbc.java src\model\Animal.java src\view\AbrigoView.java
   ```
2. Execute:
   ```powershell
   java -cp "out;lib\sqlite-jdbc.jar" Main
   ```
