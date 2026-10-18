## KOM IGÅNG:
<!-- länk till deployad shoppen -->

### Steg för att starta klienten och servern lokalt:
1. Öppna `frontend/src/variables.js` och byt vilken `host` som är aktiv: kommentera bort raden med Render-adressen och avkommentera raden med `localhost`.
2. Öppna en terminal och skriv in "cd .\frontend\" och tryck Enter, efter det skriv in "npm run dev" och tryck Enter
3. Öppna en till terminal och skriv in "cd .\backend\" och tryck Enter, efter det skriv in "npm run dev" och tryck Enter

### Testkonton:

- Kund: user1
- Lösenord: 123

### Nycklar, importtest, söktest
- Kopiera .env.example till .env och fyll i värdena. SUPPLIER_API_KEY är demonyckeln från leverantörens dokumentation. Skapa ett gratis konto på Algolia och hämta App ID, admin-nyckel och search-only-nyckel från dashboarden och sätt in dom i rätt variabel i .env filen (mall i .env.example), INDEX_NAME kan fyllas med valfritt namn. Logga in som admin och gå in på Products och klicka på reindex knappen för att manuellt uppdatera indexet (den knappen använder en POST till /api/admin/algolia/reindex)

- För att testa importen, logga in som admin, uppe i URL:en lägger man till /admin för att komma till admin sidorna, klicka på products och där finns knapparna för att testa.

- Först och främst måste man köra en Reindex. Skriv sedan något i sökrutan högst upp på produktsidan. Sökningen tillåter stavfel t.ex. skriver man Anan hittar den Anna. Söker man på Anna får man också upp Hanna (som skiljer sig med en bokstav) och Lex (som har ordet "wanna" i description)

## Mina val för Labb 1:
Jag valde att skippa ean och uppdaterad från leverantören då dom inte var särskilt relevanta för just min webshop. Variants sparas som en lista och age har fått gränser från 18 till 65, 18–65 är en regel för min shop, och leverantörens åldrar ligger mellan 19 och 64 så att ingen produkt faller bort. Jag valde också att lämna mina gamla "produkter" helt orörda istället för att ändra deras kategorier för att matcha dom från leverantören för att inte behöva ändra saker och ting och riskera att andra saker i koden börjar strula eller sluta fungera som dom ska. Priset och kategorin tas rakt av, och produkter som inte klarar valideringen hoppas över med en orsak i rapporten.

## Mina val för Labb 2:
Jag valde att ge mina produkter som jag hade i databasen ett artikelnummer (sku) BF-001 och uppåt och nya produkter får nästa lediga nummer automatiskt (i detta fallet BF-013 och nästa efter det får BF-014 osv.). Produktens MongoDB id som productId så att sökträffarna kan länka till produktsidan och läggas till i varukorgen. Jag valde att göra sök funktionen på ett sånt sätt att sökningen används bara när något är skrivet i sökfältet, är fältet tomt visas den vanliga produktlistan från databasen, på grund av det så funkar produktsidan oavsett om Algolia är nere, om Algolia inte svarar visar sökningen ett begripligt felmeddelande. Sidorna räknas från 1 istället för Algolias 0 genom att adaptern översätter, jag satte en standard storlek på 12 per sida och taket är 50. Jag valde att spara databasen först så att även om Algolia inte svarar så sparas ändå produkten samt att admin får en varning om att det inte sparats i indexet, för att få ikapp indexet kan man köra en reindex. Jag har också gjort så att sku inte kan ändras när man klickat på Edit på en produkt så att man inte skapar dubbletter när man sparar produkten igen. Sist men inte minst gjorde jag så att indexet uppdateras automatiskt när en ny produkt skapas, ändras, tas bort eller importeras

## REFLEKTIONEN:

### Labb 1: 
1.1 Jag använder en fil-integration från leverantörens REST-API (csv eller xml filer) och tolkar den eftersom katalogen är stor och inte ändras så ofta så är det lättare och mer praktiskt att hämta allt istället för produkt för produkt

1.2 Jag använder Express för att X-Api-Key och leverantörens format inte ska hamna i frontend

1.3 Om man skulle bygga det själv skulle jag behöva hosta produktdatan, hålla den uppdaterad och fixa lagersaldot själv, det är lättare att outsource:a

1.4 Om leverantören är nere får vi ett begripligt felmeddelande men shoppen fortsätter att fungera med dom produkterna som redan finns i databasen. Fel nyckel ger 502 med ett meddelande i admin, och om backend är avstängd visar admin "Could not reach the server".

1.5 Risker som kommer med ett externt API är bland annat att leverantören kan ändra filformat, vår rate limit på 10 anrop och att jag är beroende av leverantören. Filens kolumner kan också ändras. Det är därför varje produkt valideras innan den sparas.

### Labb 2:
2.1 Jag använder en SDK-integration (algoliasearch) som pratar REST med Algolia och den passar för att det är färdig kod för sökanrop, indexering och nycklar så jag slipper skriva HTTP anropen själv.
2.2 Jag använder Express av samma anledning som med CSV/XML integrationen, admin nyckeln får inte hamna i webbläsaren då den kan skriva och ta bort information. Sök nyckeln går också via mitt API så att jag kan validera page och pageSize samt sätta ett tak och svara i shoppens format.
2.3 Det är bättre att integrera den här söktjänsten än att bygga den själv för att fixa stavfeltolerans, rankning och snabb sökning av mycket data är svårt och om jag skulle gjort det själv skulle jag inte bara behöva bygga en egen sökmotor utan också ett eget index.
2.4 Om Algolia skulle vara nere och man söker så får man ett felmeddelande, produktlistan funkar fortfarande för den läses in från databasen, ändra, ta bort och skapa fungerar och ger en varning till admin att det inte indexerats och sen när Algolia är uppe igen så funkar reindex knappen så allt är syncat igen.
2.5 Risken med Algolia kan vara prisändringar för gratisplanen har en cap på funktioner. En viss GDPR risk finns också med denna shoppen då det handlar om namn/beskrivning/ålder om det hade varit riktiga personer så hade deras personuppgifter behövts skickas till en tredje part. Jag hade behövt veta var datan lagras och skriva avtal med leverantören och Algolia kan ändra villkor eller APIet (SDK version 4 och 5 ser annorlunda ut).