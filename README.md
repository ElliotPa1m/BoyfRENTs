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

- Skapa ett gratis Stripe konto i testläge och lägg STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (whsec_-värdet som stripe listen skriver ut) i backend .env filen samt CLIENT_URL (http://localhost:5173) i frontend .env filen. Man behöver Stripe CLI installerat, och stripe login körs första gången

- Använd kortet 4242 4242 4242 4242 (med valfritt framtida utgångsdatum och valfri tre siffrig kod), se till att ha tripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.expired --forward-to localhost:5000/api/stripe/webhook igång lokalt med whsec_-värdet i .env filen och gå igenom beställningsflödet (add to cart, checkout, fyll i uppgifter, pay, skriv in kort uppgifterna i Stripe)

- För att testa bilduppladdningen, skapa ett gratis Supabase-projekt med en publik bucket, och lägger SUPABASE_URL (https://<id>.supabase.co), SUPABASE_SECRET_KEY och SUPABASE_BUCKET i .env filen, logga in som admin, skapa eller öppna en produkt med Edit knappen, välj en bild och ladda upp den.

## Mina val för Labb 1:
Jag valde att skippa ean och uppdaterad från leverantören då dom inte var särskilt relevanta för just min webshop. Variants sparas som en lista och age har fått gränser från 18 till 65, 18–65 är en regel för min shop, och leverantörens åldrar ligger mellan 19 och 64 så att ingen produkt faller bort. Jag valde också att lämna mina gamla "produkter" helt orörda istället för att ändra deras kategorier för att matcha dom från leverantören för att inte behöva ändra saker och ting och riskera att andra saker i koden börjar strula eller sluta fungera som dom ska. Priset och kategorin tas rakt av, och produkter som inte klarar valideringen hoppas över med en orsak i rapporten.

## Mina val för Labb 2:
Jag valde att ge mina produkter som jag hade i databasen ett artikelnummer (sku) BF-001 och uppåt och nya produkter får nästa lediga nummer automatiskt (i detta fallet BF-013 och nästa efter det får BF-014 osv.). Produktens MongoDB id som productId så att sökträffarna kan länka till produktsidan och läggas till i varukorgen. Jag valde att göra sök funktionen på ett sånt sätt att sökningen används bara när något är skrivet i sökfältet, är fältet tomt visas den vanliga produktlistan från databasen, på grund av det så funkar produktsidan oavsett om Algolia är nere, om Algolia inte svarar visar sökningen ett begripligt felmeddelande. Sidorna räknas från 1 istället för Algolias 0 genom att adaptern översätter, jag satte en standard storlek på 12 per sida och taket är 50. Jag valde att spara databasen först så att även om Algolia inte svarar så sparas ändå produkten samt att admin får en varning om att det inte sparats i indexet, för att få ikapp indexet kan man köra en reindex. Jag har också gjort så att sku inte kan ändras när man klickat på Edit på en produkt så att man inte skapar dubbletter när man sparar produkten igen. Sist men inte minst gjorde jag så att indexet uppdateras automatiskt när en ny produkt skapas, ändras, tas bort eller importeras

## Mina val för Labb 3:
Jag valde att använda Stripes hosted checkout då det lät smidigare, jag valde att priserna debiterades i USD (cents) istället för kronor då min sida var byggd med USD i åtanke från början. Jag satte in stock på mina produkter och valde att "stock" var antalet timmar som "produkten hade skrivit på kontrakt med företaget" (startsaldot låg på 10 på alla). Jag implementerade att orderstatusen gick från pending när ordern skapas, paid när webhooken bekräftat att betalningen har gått igenom en gång och cancelled när sessionen har löpt ut efter 30 minuter utan betalning. Priset räknas på servern från databasen, React skickar bara produkt och antal, webhooken verifierar signaturen så att även om samma händelse kommer flera gånger så blir ordern bara betald en gång och saldot minskar en gång.

## Mina val för Labb 4:
Jag valde att begränsa filerna till JPEG och PNG samt max 4MB både i servern och i bucketen. Varje bild får en ny unik sökväg med sku, slumpmässigt id och en ändelse, inte filnamnet från admin och en befintlig fil skrivs aldrig över. Både sökvägen imagePath och adressen imageUrl sparas på produkten, jag återanvände imageUrl så att shoppen visar den nya bilden överallt utan att jag behövde ändra i frontend. För säkerhetsskull så sparas den nyuppladdade bilden först sen tas den gamla bort så att en misslyckad uppladdning inte gör att en produkt inte har en bild. Bilduppladdningen ligger på redigeringssidan istället för skapelsesidan då det inte finns en sku eller imagePath förens efter produkten har skapats och efter produkten har skapats så tas admin till redigeringssidan direkt så dom kan ladda upp en bild. Sökindexet i Algolia uppdateras också när en bild byts ut med samma varning som innan.

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

### Labb 3:
3.1 Jag använde en SDK-integration (Stripe) med en redirect till Stripes sida och en webhook. Den passar för att det är färdig och etablerad kod för betalningar på det sättet hanteras inte kortuppgifterna av min server och webhooken behövs då betalningen bekräftas i efterhand, på det sättet är det inte webbläsaren utan servern som markerar orders som betalda.

3.2 Jag använde Express för att det finns hemliga nycklar som inte får hamna i webbläsaren och att priset räknas från servern och inte frontend.

3.3 Jag valde att integrera för kortbetalningar kräver PCI-hantering och säkerhet som är svårt att återskapa snabbt/lätt. Det hjälper också med att hantera kortuppgifter säkert, bankkopplingar, 3-D Secure (extra godkännande) och bedrägeriskydd.

3.4 Om Stripe är nere skickar jag ett 502 fel meddelande som ger ett begripligt svar på vad som är fel och ordern förblir pending tills den blir betald eller sessionen går ut och blir cancelled.

3.5 Riskerna med Stripe kan vara avgifter mellan Stripe och företaget, ändrade vilkor från Stripe, att ha personuppgifter hos en tredje part och att varje köp kostar en avgift per transaktion.

### Labb 4:
4.1 Jag använde en SDK-integration (Supabase) mot Supabase Storage via REST där servern tar emot filen och laddar upp den, bilderna visas sen direkt från Supabase.

4.2 Jag använde Express för att den hemliga nyckeln kan skriva och ta bort och den får inte hamna i webbläsaren. Servern kan dessutom validera filtypen och storleken innan något laddas upp.

4.3  Jag valde att integrera för att lagra, visa och cacha bilder globalt samt hantera backup är svårt och en egen lösning skulle kräva en filserver, lagringsutrymme och snabb leverans.

4.4 Om Supabase är nere får admin ett begripligt meddelande (502), produkten behåller den gamla bilden och shoppen visar bilderna som redan ligger i bucketen om lagringen svarar, annars en "trasig" bild.

4.5 Risker med detta är bland annat att gratisplanen har begränsningar (1 GB lagring totalt, 50MB per fil), och gratisprojekt pausas efter en veckas inaktivitet (Render och Supabase), vilket gör att bilderna inte går att nå förrän projektet väcks. Villkoren kan ändras och bilder på personer är personuppgifter som hamnar hos en tredje part, så man behöver veta var datan lagras och ha ett avtal med leverantören.