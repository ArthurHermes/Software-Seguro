import controller.AbrigoController;
import dao.AnimalDao;
import dao.AnimalDaoJdbc;
import java.net.URISyntaxException;
import java.nio.file.Path;
import view.AbrigoView;

public class Main {
    public static void main(String[] args) {
        String url = construirUrlSqlite();
        AnimalDao animalDao = new AnimalDaoJdbc(url);
        AbrigoView view = new AbrigoView();
        AbrigoController controller = new AbrigoController(animalDao, view);

        System.out.println("Banco SQLite em uso: " + url.replace("jdbc:sqlite:", ""));
        controller.iniciar();
    }

    private static String construirUrlSqlite() {
        try {
            Path codeSourcePath = Path.of(
                    Main.class.getProtectionDomain().getCodeSource().getLocation().toURI());
            Path baseDir = codeSourcePath.getParent();
            Path dbPath = baseDir.resolve("abrigo.db").toAbsolutePath().normalize();
            return "jdbc:sqlite:" + dbPath;
        } catch (URISyntaxException | IllegalArgumentException | SecurityException e) {
            Path fallback = Path.of("abrigo.db").toAbsolutePath().normalize();
            return "jdbc:sqlite:" + fallback;
        }
    }
}
