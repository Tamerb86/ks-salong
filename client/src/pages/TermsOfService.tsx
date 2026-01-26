import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-orange-500 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <Link href="/">
            <button className="flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-4">
              <ArrowLeft className="h-5 w-5" />
              Tilbake til forsiden
            </button>
          </Link>
          <h1 className="text-3xl font-bold">Vilkår for bruk</h1>
          <p className="text-white/90 mt-2">Sist oppdatert: {new Date().toLocaleDateString('nb-NO')}</p>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aksept av vilkår</h2>
            <p className="text-gray-700 leading-relaxed">
              Ved å få tilgang til eller bruke K.S Salongs tjenester, inkludert vårt online booking-system, 
              nettsted og fysiske salongtjenester, godtar du å være bundet av disse vilkårene for bruk. 
              Hvis du ikke godtar alle vilkårene, må du ikke bruke våre tjenester.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Vi forbeholder oss retten til å endre disse vilkårene når som helst. Endringer trer i kraft 
              umiddelbart ved publisering på nettstedet. Din fortsatte bruk av tjenestene etter slike 
              endringer utgjør din aksept av de nye vilkårene.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Tjenestebeskrivelse</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              K.S Salong tilbyr profesjonelle frisørtjenester, inkludert men ikke begrenset til:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Herre- og dameklipp</li>
              <li>Hårfarge og highlights</li>
              <li>Skjeggtrim og styling</li>
              <li>Hårkur og behandlinger</li>
              <li>Konsultasjonstjenester</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Vi tilbyr også et online booking-system for å lette bestilling av avtaler. Alle tjenester 
              leveres av kvalifiserte og erfarne frisører.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Booking og avtaler</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.1 Online booking</h3>
            <p className="text-gray-700 leading-relaxed">
              Du kan bestille avtaler gjennom vårt online booking-system. Ved å fullføre en booking 
              samtykker du til å møte opp til avtalt tid eller gi beskjed om avlysning i henhold til 
              våre avlysningsregler.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.2 Bekreftelse</h3>
            <p className="text-gray-700 leading-relaxed">
              Du vil motta en bookingbekreftelse via e-post eller SMS etter vellykket booking. 
              Vennligst bekreft at alle detaljer er korrekte. Hvis du ikke mottar bekreftelse, 
              kontakt oss umiddelbart.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.3 Forsinkelser</h3>
            <p className="text-gray-700 leading-relaxed">
              Hvis du kommer mer enn 15 minutter for sent til avtalen din, forbeholder vi oss retten 
              til å avlyse avtalen eller redusere tjenestetiden tilsvarende. Vi kan ikke garantere at 
              vi kan fullføre tjenesten hvis du kommer for sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Avlysning og endring</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.1 Avlysningsfrist</h3>
            <p className="text-gray-700 leading-relaxed">
              Du kan avlyse eller endre avtalen din kostnadsfritt frem til <strong>24 timer før</strong> 
              avtalt tid. Avlysning kan gjøres via avlysningslenken i bookingbekreftelsen eller ved å 
              kontakte oss direkte.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.2 Sen avlysning</h3>
            <p className="text-gray-700 leading-relaxed">
              Avlysninger mindre enn 24 timer før avtalt tid kan medføre et avlysningsgebyr på 
              <strong> 50% av tjenestens pris</strong>. Dette gebyret dekker tapte inntekter og 
              administrasjonskostnader.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.3 Uteblivelse (No-show)</h3>
            <p className="text-gray-700 leading-relaxed">
              Hvis du ikke møter opp til avtalen uten å gi beskjed, vil du bli belastet <strong>100% 
              av tjenestens pris</strong>. Gjentatte uteblivelser kan føre til at du nektes fremtidige 
              bookinger.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.4 Vår rett til avlysning</h3>
            <p className="text-gray-700 leading-relaxed">
              Vi forbeholder oss retten til å avlyse avtaler på grunn av sykdom, nødsituasjoner eller 
              andre uforutsette omstendigheter. I slike tilfeller vil du bli varslet så snart som mulig, 
              og vi vil tilby alternativ tid eller full refusjon.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Betaling</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.1 Betalingsmetoder</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Vi aksepterer følgende betalingsmetoder:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Kontant</li>
              <li>Bankkort (Visa, Mastercard)</li>
              <li>Vipps</li>
              <li>Stripe (online betaling)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.2 Priser</h3>
            <p className="text-gray-700 leading-relaxed">
              Alle priser er oppgitt i norske kroner (NOK) og inkluderer merverdiavgift (MVA). 
              Priser kan endres uten forvarsel, men endringer vil ikke påvirke allerede bekreftede 
              bookinger.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.3 Forhåndsbetaling</h3>
            <p className="text-gray-700 leading-relaxed">
              For enkelte tjenester eller ved online booking kan vi kreve forhåndsbetaling. 
              Dette vil være tydelig angitt under bookingprosessen.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.4 Refusjon</h3>
            <p className="text-gray-700 leading-relaxed">
              Refusjon gis kun i henhold til våre avlysningsregler eller hvis vi avlyser avtalen. 
              Refusjoner behandles innen 5-10 virkedager.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Kundens ansvar</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.1 Nøyaktig informasjon</h3>
            <p className="text-gray-700 leading-relaxed">
              Du er ansvarlig for å oppgi nøyaktig og fullstendig informasjon ved booking, inkludert 
              kontaktinformasjon, allergier, og spesielle behov eller ønsker.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.2 Helseopplysninger</h3>
            <p className="text-gray-700 leading-relaxed">
              Du må informere oss om eventuelle allergier, hudtilstander eller andre helseforhold som 
              kan påvirke behandlingen. Unnlatelse av å gi slik informasjon kan føre til at vi nekter 
              å utføre tjenesten.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.3 Oppførsel</h3>
            <p className="text-gray-700 leading-relaxed">
              Du forventes å oppføre deg respektfullt overfor våre ansatte og andre kunder. Vi 
              forbeholder oss retten til å nekte service til kunder som opptrer truende, fornærmende 
              eller på annen måte upassende.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Vårt ansvar og ansvarsfraskrivelse</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">7.1 Tjenestekvalitet</h3>
            <p className="text-gray-700 leading-relaxed">
              Vi streber etter å levere tjenester av høyeste kvalitet. Hvis du ikke er fornøyd med 
              resultatet, vennligst gi oss beskjed umiddelbart slik at vi kan forsøke å rette opp 
              situasjonen.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">7.2 Ansvarsbegrensning</h3>
            <p className="text-gray-700 leading-relaxed">
              K.S Salong er ikke ansvarlig for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-3">
              <li>Allergiske reaksjoner eller hudirritasjoner som ikke er forårsaket av vårt produkt eller vår uaktsomhet</li>
              <li>Resultater som ikke oppfyller dine forventninger hvis du ikke har kommunisert dine ønsker tydelig</li>
              <li>Skader eller tap som oppstår fra din egen uaktsomhet eller manglende overholdelse av etterbehandlingsinstruksjoner</li>
              <li>Tekniske problemer med online booking-systemet som er utenfor vår kontroll</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">7.3 Maksimalt ansvar</h3>
            <p className="text-gray-700 leading-relaxed">
              Vårt maksimale ansvar overfor deg er begrenset til beløpet du har betalt for den aktuelle 
              tjenesten.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Immaterielle rettigheter</h2>
            <p className="text-gray-700 leading-relaxed">
              Alt innhold på vårt nettsted, inkludert tekst, grafikk, logoer, bilder og programvare, 
              er eid av K.S Salong eller våre lisensgivere og er beskyttet av opphavsrett og andre 
              immaterielle rettigheter. Du kan ikke kopiere, reprodusere, distribuere eller på annen 
              måte bruke slikt innhold uten vårt skriftlige samtykke.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Personvern</h2>
            <p className="text-gray-700 leading-relaxed">
              Din bruk av våre tjenester er også underlagt vår{" "}
              <Link href="/privacy-policy">
                <a className="text-purple-600 hover:underline font-semibold">Personvernerklæring</a>
              </Link>
              , som beskriver hvordan vi samler inn, bruker og beskytter personopplysningene dine.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Tvisteløsning</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">10.1 Gjeldende lov</h3>
            <p className="text-gray-700 leading-relaxed">
              Disse vilkårene er underlagt og skal tolkes i samsvar med norsk lov.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">10.2 Verneting</h3>
            <p className="text-gray-700 leading-relaxed">
              Eventuelle tvister som oppstår i forbindelse med disse vilkårene skal løses ved 
              Porsgrunn tingrett, med mindre annet er påkrevd av lov.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">10.3 Klageorgan</h3>
            <p className="text-gray-700 leading-relaxed">
              Hvis du har en klage, oppfordrer vi deg til å kontakte oss direkte først. Hvis vi ikke 
              kan løse saken til din tilfredshet, kan du klage til Forbrukertilsynet eller 
              Forbrukerrådet.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Diverse bestemmelser</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">11.1 Helhet</h3>
            <p className="text-gray-700 leading-relaxed">
              Hvis noen bestemmelse i disse vilkårene blir funnet ugyldig eller ikke kan håndheves, 
              skal de resterende bestemmelsene fortsatt være i full kraft.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">11.2 Overdragelse</h3>
            <p className="text-gray-700 leading-relaxed">
              Du kan ikke overføre dine rettigheter eller forpliktelser under disse vilkårene uten 
              vårt skriftlige samtykke. Vi kan overføre våre rettigheter og forpliktelser til en 
              tredjepart uten ditt samtykke.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">11.3 Force majeure</h3>
            <p className="text-gray-700 leading-relaxed">
              Vi er ikke ansvarlige for manglende oppfyllelse av våre forpliktelser på grunn av 
              omstendigheter utenfor vår rimelige kontroll, inkludert men ikke begrenset til 
              naturkatastrofer, krig, streik, pandemier eller myndighetspålegg.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Kontakt oss</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Hvis du har spørsmål om disse vilkårene for bruk, vennligst kontakt oss:
            </p>
            <div className="bg-purple-50 rounded-lg p-6 space-y-2">
              <p className="text-gray-800"><strong>K.S Salong</strong></p>
              <p className="text-gray-700">Storgata 122C, 3915 Porsgrunn, Norge</p>
              <p className="text-gray-700">Telefon: <a href="tel:+4792981628" className="text-purple-600 hover:underline">+47 929 81 628</a></p>
              <p className="text-gray-700">E-post: <a href="mailto:post@ks-salong.no" className="text-purple-600 hover:underline">post@ks-salong.no</a></p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Ved å bruke K.S Salongs tjenester bekrefter du at du har lest, forstått og godtar disse vilkårene for bruk.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
