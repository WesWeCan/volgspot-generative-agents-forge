export const prompts = {

    worldContext: {
        system: "Het is 2052. De wereld is in de ban van AI. Jaarlijks word 'de Spark' georganiseerd waarvan deze editie de 25e isHet nieuws wordt geschreven door de ogen van de overheid die de Spark beheert dit is altijd in het goede daglicht van de organisatie. De huidige context gaat over: ",
        messages: [
            ""
        ]
    },


    genTopic: {
        system: "Antwoord alleen in het Nederlands. Verzin ${numTopics} onderwerpen voor nieuwsartikelen. Dit is de context van de onderwerpen: ${context}. Schrijf de onderwerpen als 1 zin.  Antwoord alleen met de onderwerpen. Gebruik geen placeholders. Antwoord ALLEEN met de onderwerpen.",
        messages: [
            "De ${numTopics} onderwerpen zijn: ",
        ]
    },


    writeArticle: {
        system: "Antwoord alleen in het Nederlands. Schrijf een gemiddeld lang nieuwsartikel voor op een nieuwssite. --(algemene informatie over deze wereld) Het is 2052. De wereld is in de ban van AI. Jaarlijks word 'de Spark' georganiseerd waarvan deze editie de 25e is, de komende editie is in maart. Tijdens deze editie zijn er twee teams, Bèta en Gamma. Er is nog weinig bekend over hoe de show zal zijn.-- Het nieuws wordt geschreven door de ogen van de overheid die de Spark organiseert dit is altijd in het goede daglicht van de organisatie. Het artikel hoeft niet altijd te benoemen dat de Spark georganiseerd wordt, laat dat afhangen van de titel. Het nieuwsbericht heeft de titel: ${title}. ${extra}. Format het als HTML. De titel hoeft niet geschreven te worden. Er hoeft geen plaats en datum te worden toegevoegd. Schrijf het artikel tijdloos, gebruik geen placeholders.",
        messages: [
            "<h1>${title}</h1>",
            "Content: ",
        ]
    },


    extractList: {
        system: "Read the following content. Make an array of strings. Based on the content: ${content} | ONLY RETURN THE ARRAY. DON'T FORMAT. DO NOT RETURN ANYTHING ELSE.",
            messages: [
                "The array: "
            ]
        },

        image: {
            system: "Antwoord in het Engels. Het is 2052. Schrijf een prompt voor het genereren van een nieuwsafbeelding voor het volgende artikel: ${title}, ${content}. Maak de afbeelding zoals een nieuwsafdeling het zou maken. Het kan een foto of illustratie zijn. Antwoord ALLEEN met de prompt. In English!",
            messages: [
                "The prompt for generating the image:"
            ]
        },

}