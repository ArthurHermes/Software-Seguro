package dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import model.Animal;

public class AnimalDaoJdbc implements AnimalDao {
    private final String url;

    public AnimalDaoJdbc(String url) {
        this.url = url;
        carregarDriverSqlite();
        criarTabelaSeNecessario();
    }

    @Override
    public Animal cadastrar(String nome, String especie, int idade) {
        String sql = "INSERT INTO animais (nome, especie, idade) VALUES (?, ?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, nome);
            stmt.setString(2, especie);
            stmt.setInt(3, idade);
            stmt.executeUpdate();

            try (ResultSet keys = stmt.getGeneratedKeys()) {
                if (keys.next()) {
                    int id = keys.getInt(1);
                    return new Animal(id, nome, especie, idade);
                }
            }

            throw new RuntimeException("Nao foi possivel recuperar o ID gerado.");
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao cadastrar animal.", e);
        }
    }

    @Override
    public List<Animal> listarTodos() {
        String sql = "SELECT id, nome, especie, idade FROM animais ORDER BY id";
        List<Animal> animais = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                animais.add(mapearAnimal(rs));
            }
            return animais;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao listar animais.", e);
        }
    }

    @Override
    public Animal buscarPorId(int id) {
        String sql = "SELECT id, nome, especie, idade FROM animais WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapearAnimal(rs);
                }
            }
            return null;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar animal por ID.", e);
        }
    }

    @Override
    public boolean atualizar(int id, String nome, String especie, int idade) {
        String sql = "UPDATE animais SET nome = ?, especie = ?, idade = ? WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, nome);
            stmt.setString(2, especie);
            stmt.setInt(3, idade);
            stmt.setInt(4, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar animal.", e);
        }
    }

    @Override
    public boolean excluirPorId(int id) {
        String sql = "DELETE FROM animais WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao excluir animal.", e);
        }
    }

    private Connection getConnection() throws SQLException {
        return DriverManager.getConnection(url);
    }

    private void carregarDriverSqlite() {
        try {
            Class.forName("org.sqlite.JDBC");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("Driver JDBC do SQLite nao encontrado no classpath.", e);
        }
    }

    private void criarTabelaSeNecessario() {
        String sql = "CREATE TABLE IF NOT EXISTS animais ("
                + "id INTEGER PRIMARY KEY AUTOINCREMENT, "
                + "nome TEXT NOT NULL, "
                + "especie TEXT NOT NULL, "
                + "idade INTEGER NOT NULL CHECK (idade >= 0)"
                + ")";

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute(sql);
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inicializar banco de dados.", e);
        }
    }

    private Animal mapearAnimal(ResultSet rs) throws SQLException {
        int id = rs.getInt("id");
        String nome = rs.getString("nome");
        String especie = rs.getString("especie");
        int idade = rs.getInt("idade");
        return new Animal(id, nome, especie, idade);
    }
}
