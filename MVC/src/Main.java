import controller.AbrigoController;
import dao.AnimalDao;
import dao.AnimalDaoMemoria;
import view.AbrigoView;

public class Main {
    public static void main(String[] args) {
        AnimalDao animalDao = new AnimalDaoMemoria();
        AbrigoView view = new AbrigoView();
        AbrigoController controller = new AbrigoController(animalDao, view);

        controller.iniciar();
    }
}
