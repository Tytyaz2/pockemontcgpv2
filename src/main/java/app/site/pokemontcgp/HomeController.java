package app.site.pokemontcgp;


import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home(Model model) throws IOException {
        // Liste des collections disponibles
        String[] collections = {"a1", "a1a", "a2", "a2a", "a2b", "a3"};

        // Préparer les données pour chaque collection
        for (String collection : collections) {
            List<String> cards = getCardsForCollection(collection);
            model.addAttribute(collection + "Cards", cards);
        }

        return "collections";
    }

    private List<String> getCardsForCollection(String collectionName) throws IOException {
        Resource[] resources = new PathMatchingResourcePatternResolver()
                .getResources("classpath:static/" + collectionName + "/*.png");

        return Arrays.stream(resources)
                .map(resource -> resource.getFilename())
                .sorted()
                .collect(Collectors.toList());
    }
}
