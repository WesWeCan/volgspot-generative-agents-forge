export const prompts = {
    genCharacter:
    {
        name: {
            system: "Antwoord alleen in het Nederlands. Bedenk een willekeurige ${type} naam. Antwoord alleen met de naam.",
            messages: [
                "De voor en achternaam van de persoon zijn: "
            ]
        },

        userName: {
            system: "Antwoord alleen in het Nederlands. Bedenk een willekeurige gebruikersnaam gebaseerd op de naam ${name}. Wees creatief Antwoord alleen met de gebruikersnaam. Start met een @.",
            messages: [
                "De gebruikersnaam van de persoon is: @"
            ]
        },

        traits: {
            system: "Antwoord alleen in het Nederlands. Bedenk een willekeurige eigenschap. Antwoord alleen met de eigenschap. Antwoord met 1 woord",
            messages: [
                "Wat is de eigenschap van de persoon die je in gedachten hebt? Antwoord met 1 woord. Het eigenschap: "
            ]
        },


        description: {
            system: "Antwoord alleen in het Nederlands. Bedenk een willekeurige beschrijving voor deze persoon: ${name}. Het jaartal is 2052, de wereld is in de ban van AI. Deze persoon heeft de volgende karakter eigenschappen: ${traits}. ",
            messages: [
                "De beschrijving van de persoon: "
            ]
        },

        makeMemories: {
            system: "Antwoord alleen in het Nederlands. Maak van de beschrijving een lijst van herinneringen over deze persoon. Dit is een beschrijving van het fictieve personage ${name}: ${description}. Zorg ervoor dat de herinneringen in het volgende format zijn: [naam] [geloof/herinnering]",
            messages: [
                "De lijst aan herinneringen: "
            ]
        },

        shortBio: {
            system: "Antwoord alleen in het Nederlands. Maak een korte bio voor social media, Twitter, Facebook, Instagram, etc. van deze persoon: ${description}.  Antwoord alleen met de biografie. Schrijf het als 1 zin. Schrijf het zoals deze persoon zelf het zelf zou schrijven.",
            messages: [
                "De biografie van de persoon: "
            ]
        },

        extractList: {
        system: "Read the following content. Make an array of strings. Based on the content: ${content} | ONLY RETURN THE ARRAY. DON'T FORMAT. DO NOT RETURN ANYTHING ELSE.",
            messages: [
                "The array: "
            ]
        },


        profilePicture: {
            system: "Antwoord in het Engels. Schrijf een prompt voor het genereren van een profile picture van een persoon met de volgende eigenschappen: ${name}, ${traits}, ${description}. Maak de afbeelding zoals deze persoon zelf het zelf zou maken, dat hoeft niet altijd een foto van de persoon te zijn. Antwoord ALLEEN met de prompt. In English!",
            messages: [
                "The prompt for generating the profile picture: "
            ]
        },


    },


    postWriting:
    {

        writePost: {
            system: "Antwoord alleen in het Nederlands. Schrijf een korte bericht voor social media. Het moet gaan over ${topic}. Schrijf het namens ${name}. Schrijf het als 1 zin (max 280 tekens). Schrijf het zoals deze persoon zelf het zelf zou schrijven. De karaktereigenschappen zijn ${traits}. Als persoon is ${name} het volgende: ${memories} Antwoord alleen met de bericht. Antwoord ALLEEN met de bericht.",
            messages: [
                "${userName} schrijft: ",
            ]
        },

        react: {
            system: "Antwoord alleen in het Nederlands. Reactie op de content: ${content}. Deze content is in de context van ${context} Schrijf de reactie zoal ${name} zelf zou schrijven. Als karakter is ${name} het volgende: ${traits} met de herinneringen: ${memories}. Antwoord ALLEEN met de reactie.",
            messages: [
                "${userName} reageert: ",
            ]
        },

        brainstormTopics: {
            system: "Antwoord alleen in het Nederlands. Brainstorm topics voor een nieuwe post. Schrijf de topics als 1 zin. Bedenk 10 onderwerpen voor posts. Schrijf het zoals deze persoon zelf het zelf zou schrijven. De karaktereigenschappen zijn ${traits}. Als persoon is ${name} het volgende: ${memories}. Antwoord alleen met de topics. Antwoord ALLEEN met de topics.",
            messages: [
                "De topics: "
            ]
        },
    },


}