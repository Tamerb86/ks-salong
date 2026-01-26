import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPolicy() {
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
          <h1 className="text-3xl font-bold">Personvernerklæring</h1>
          <p className="text-white/90 mt-2">Sist oppdatert: {new Date().toLocaleDateString('nb-NO')}</p>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Innledning</h2>
            <p className="text-gray-700 leading-relaxed">
              K.S Salong ("vi", "oss" eller "vår") er forpliktet til å beskytte personvernet ditt. 
              Denne personvernerklæringen forklarer hvordan vi samler inn, bruker, deler og beskytter 
              personopplysningene dine når du bruker våre tjenester, inkludert online booking-system, 
              kundeportal og fysiske salongtjenester.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Ved å bruke våre tjenester samtykker du til innsamling og bruk av informasjon i samsvar 
              med denne erklæringen og gjeldende personvernlovgivning, inkludert EUs 
              personvernforordning (GDPR).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Informasjon vi samler inn</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.1 Personopplysninger</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Vi samler inn følgende typer personopplysninger:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Kontaktinformasjon:</strong> Navn, telefonnummer, e-postadresse</li>
              <li><strong>Bookingopplysninger:</strong> Valgte tjenester, foretrukket tid, spesielle ønsker</li>
              <li><strong>Betalingsinformasjon:</strong> Transaksjonsdetaljer (ikke fullstendige kortnummer)</li>
              <li><strong>Besøkshistorikk:</strong> Tidligere avtaler, kjøpte tjenester og produkter</li>
              <li><strong>Preferanser:</strong> Foretrukket frisør, stilpreferanser, produktpreferanser</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.2 Teknisk informasjon</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>IP-adresse og nettlesertype</li>
              <li>Enhetsinformasjon og operativsystem</li>
              <li>Cookies og lignende sporingsteknologier</li>
              <li>Bruksmønstre på nettstedet</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Hvordan vi bruker informasjonen</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Vi bruker innsamlede personopplysninger til følgende formål:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Tjenesteleveranse:</strong> Behandle bookinger, levere frisørtjenester</li>
              <li><strong>Kommunikasjon:</strong> Sende bookingbekreftelser, påminnelser, avlysningsvarsler</li>
              <li><strong>Betalingsbehandling:</strong> Behandle betalinger via Vipps, Stripe eller andre betalingsmetoder</li>
              <li><strong>Kundeservice:</strong> Svare på henvendelser, løse problemer, gi support</li>
              <li><strong>Forbedring av tjenester:</strong> Analysere bruksmønstre for å forbedre opplevelsen</li>
              <li><strong>Markedsføring:</strong> Sende tilbud og nyheter (kun med ditt samtykke)</li>
              <li><strong>Juridisk overholdelse:</strong> Oppfylle lovpålagte krav og forretningsformål</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Deling av informasjon</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Vi deler ikke personopplysningene dine med tredjeparter, unntatt:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Betalingsleverandører:</strong> Vipps, Stripe for sikker betalingsbehandling</li>
              <li><strong>Teknologileverandører:</strong> Hosting, database, og IT-infrastruktur</li>
              <li><strong>Juridiske krav:</strong> Når loven krever det eller for å beskytte våre rettigheter</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Vi selger eller leier aldri ut personopplysningene dine til tredjeparter for markedsføringsformål.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Lagring og sikkerhet</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.1 Lagringsperiode</h3>
            <p className="text-gray-700 leading-relaxed">
              Vi lagrer personopplysningene dine så lenge det er nødvendig for å levere tjenestene våre 
              og oppfylle juridiske forpliktelser. Kundedata lagres vanligvis i 3 år etter siste besøk, 
              med mindre du ber om sletting tidligere.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.2 Sikkerhetstiltak</h3>
            <p className="text-gray-700 leading-relaxed">
              Vi implementerer passende tekniske og organisatoriske sikkerhetstiltak for å beskytte 
              personopplysningene dine mot uautorisert tilgang, endring, avsløring eller ødeleggelse:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-3">
              <li>SSL/TLS-kryptering for datatransmisjon</li>
              <li>Krypterte databaser</li>
              <li>Regelmessige sikkerhetsrevisjoner</li>
              <li>Begrenset tilgang til personopplysninger (kun autorisert personell)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Dine rettigheter under GDPR</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Du har følgende rettigheter i henhold til GDPR:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Rett til innsyn:</strong> Be om kopi av personopplysningene vi har om deg</li>
              <li><strong>Rett til retting:</strong> Be om korrigering av unøyaktige eller ufullstendige opplysninger</li>
              <li><strong>Rett til sletting:</strong> Be om sletting av personopplysningene dine ("retten til å bli glemt")</li>
              <li><strong>Rett til begrensning:</strong> Be om begrensning av behandlingen av opplysningene dine</li>
              <li><strong>Rett til dataportabilitet:</strong> Motta personopplysningene dine i et strukturert format</li>
              <li><strong>Rett til å protestere:</strong> Protestere mot behandling av personopplysningene dine</li>
              <li><strong>Rett til å trekke tilbake samtykke:</strong> Når som helst, uten at det påvirker lovligheten av behandlingen før tilbaketrekkingen</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              For å utøve disse rettighetene, vennligst kontakt oss på kontaktinformasjonen nedenfor.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              Vi bruker cookies og lignende sporingsteknologier for å forbedre brukeropplevelsen, 
              analysere nettstedstrafikk og personalisere innhold. Du kan kontrollere cookie-innstillinger 
              gjennom nettleseren din. Vær oppmerksom på at deaktivering av cookies kan påvirke 
              funksjonaliteten til nettstedet vårt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Endringer i personvernerklæringen</h2>
            <p className="text-gray-700 leading-relaxed">
              Vi kan oppdatere denne personvernerklæringen fra tid til annen. Vi vil varsle deg om 
              vesentlige endringer ved å publisere den nye erklæringen på denne siden og oppdatere 
              "Sist oppdatert"-datoen øverst. Vi oppfordrer deg til å gjennomgå denne erklæringen 
              regelmessig for å holde deg informert om hvordan vi beskytter informasjonen din.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Kontakt oss</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Hvis du har spørsmål om denne personvernerklæringen eller ønsker å utøve dine rettigheter, 
              vennligst kontakt oss:
            </p>
            <div className="bg-purple-50 rounded-lg p-6 space-y-2">
              <p className="text-gray-800"><strong>K.S Salong</strong></p>
              <p className="text-gray-700">Storgata 122C, 3915 Porsgrunn, Norge</p>
              <p className="text-gray-700">Telefon: <a href="tel:+4792981628" className="text-purple-600 hover:underline">+47 929 81 628</a></p>
              <p className="text-gray-700">E-post: <a href="mailto:post@ks-salong.no" className="text-purple-600 hover:underline">post@ks-salong.no</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Klagerett</h2>
            <p className="text-gray-700 leading-relaxed">
              Hvis du mener at behandlingen av personopplysningene dine bryter med GDPR, har du rett 
              til å klage til Datatilsynet i Norge:
            </p>
            <div className="bg-orange-50 rounded-lg p-6 space-y-2 mt-4">
              <p className="text-gray-800"><strong>Datatilsynet</strong></p>
              <p className="text-gray-700">Postboks 458 Sentrum, 0105 Oslo</p>
              <p className="text-gray-700">Telefon: 22 39 69 00</p>
              <p className="text-gray-700">E-post: <a href="mailto:postkasse@datatilsynet.no" className="text-orange-600 hover:underline">postkasse@datatilsynet.no</a></p>
              <p className="text-gray-700">Nettsted: <a href="https://www.datatilsynet.no" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">www.datatilsynet.no</a></p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
