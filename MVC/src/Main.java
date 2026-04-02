import controller.AbrigoController;
import dao.AnimalDao;
import dao.AnimalDaoJdbc;
import view.AbrigoView;

public class Main {
    public static void main(String[] args) {
        String url = "jdbc:sqlite:abrigo.db";
        AnimalDao animalDao = new AnimalDaoJdbc(url);
        AbrigoView view = new AbrigoView();
        AbrigoController controller = new AbrigoController(animalDao, view);

        controller.iniciar();
    }
}
