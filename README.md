## KOM IGÅNG:
<!-- länk till deployad shoppen -->

### Steg för att starta klienten och servern lokalt:
1. Öppna `frontend/src/variables.js` och byt vilken `host` som är aktiv: kommentera bort raden med Render-adressen och avkommentera raden med `localhost`.
2. Öppna en terminal och skriv in "cd .\frontend\" och tryck Enter, efter det skriv in "npm run dev" och tryck Enter
3. Öppna en till terminal och skriv in "cd .\backend\" och tryck Enter, efter det skriv in "npm run dev" och tryck Enter

### Testkonton:

- Kund: user1
- Lösenord: 123

### Nycklar och importtest
Kopiera .env.example till .env och fyll i värdena. SUPPLIER_API_KEY är demonyckeln från leverantörens dokumentation

För att testa importen, logga in som admin, uppe i URL:en lägger man till /admin för att komma till admin sidorna, klicka på products och där finns knapparna för att testa.

## Mina val för Labb 1:
Jag valde att skippa ean och uppdaterad från leverantören då dom inte var särskilt relevanta för just min webshop. Variants sparas som en lista och age har fått gränser från 18 till 65, 18–65 är en regel för min shop, och leverantörens åldrar ligger mellan 19 och 64 så att ingen produkt faller bort. Jag valde också att lämna mina gamla "produkter" helt orörda istället för att ändra deras kategorier för att matcha dom från leverantören för att inte behöva ändra saker och ting och riskera att andra saker i koden börjar strula eller sluta fungera som dom ska. Priset och kategorin tas rakt av, och produkter som inte klarar valideringen hoppas över med en orsak i rapporten.

## REFLEKTIONEN:

Labb 1: 
1.1 Jag använder en fil-integration från leverantörens REST-API (csv eller xml filer) och tolkar den eftersom katalogen är stor och inte ändras så ofta så är det lättare och mer praktiskt att hämta allt istället för produkt för produkt

1.2 Jag använder Express för att X-Api-Key och leverantörens format inte ska hamna i frontend

1.3 Om man skulle bygga det själv skulle jag behöva hosta produktdatan, hålla den uppdaterad och fixa lagersaldot själv, det är lättare att outsource:a

1.4 Om leverantören är nere får vi ett begripligt felmeddelande men shoppen fortsätter att fungera med dom produkterna som redan finns i databasen. Fel nyckel ger 502 med ett meddelande i admin, och om backend är avstängd visar admin "Could not reach the server".

1.5 Risker som kommer med ett externt API är bland annat att leverantören kan ändra filformat, vår rate limit på 10 anrop och att jag är beroende av leverantören. Filens kolumner kan också ändras. Det är därför varje produkt valideras innan den sparas.