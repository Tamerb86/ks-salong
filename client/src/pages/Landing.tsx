import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MapPin, Clock, Star, Award, Users, Scissors, Lock } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Landing() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to dashboard login (PIN entry)
  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation("/dashboard-login");
    }
  }, [isAuthenticated, loading, setLocation]);

  useEffect(() => {
    // Set SEO meta tags
    document.title = "K.S Frisør - Norgesmester 2022 | Frisørsalong i Porsgrunn";
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'K.S Frisør - Prisbelønt frisørsalong i Porsgrunn. Norgesmester 2022. Profesjonelle tjenester for herre og dame. Book time online. 5 stjerner fra 55+ fornøyde kunder.');
    
    // Update or create meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'frisør porsgrunn, herreklipp, dameklipp, skjegg trim, hårfarge, K.S Frisør, norgesmester frisør, beste frisør porsgrunn');
    
    // Add JSON-LD structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "LocalBusiness",
          "@id": "https://ks-salong.manus.space/#business",
          "name": "K.S Frisør",
          "image": "https://ks-salong.manus.space/logo.png",
          "description": "Prisbeslønt frisørsalong i Porsgrunn. Norgesmester 2022. Profesjonelle tjenester for herre og dame.",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Storgata 150",
            "addressLocality": "Porsgrunn",
            "postalCode": "3915",
            "addressCountry": "NO"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 59.1403,
            "longitude": 9.6561
          },
          "telephone": "+4735555666",
          "priceRange": "kr 250-800",
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              "opens": "09:00",
              "closes": "18:00"
            },
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": "Saturday",
              "opens": "10:00",
              "closes": "15:00"
            }
          ],
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "5.0",
            "reviewCount": "55",
            "bestRating": "5",
            "worstRating": "1"
          },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Frisørtjenester",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Herreklipp",
                  "description": "Profesjonell herreklipp med styling",
                  "provider": {
                    "@id": "https://ks-salong.manus.space/#business"
                  }
                },
                "price": "350",
                "priceCurrency": "NOK"
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Dameklipp",
                  "description": "Profesjonell dameklipp med styling",
                  "provider": {
                    "@id": "https://ks-salong.manus.space/#business"
                  }
                },
                "price": "450",
                "priceCurrency": "NOK"
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Skjegg trim",
                  "description": "Profesjonell skjegg trim og styling",
                  "provider": {
                    "@id": "https://ks-salong.manus.space/#business"
                  }
                },
                "price": "200",
                "priceCurrency": "NOK"
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Hårfarge",
                  "description": "Profesjonell hårfarge og behandling",
                  "provider": {
                    "@id": "https://ks-salong.manus.space/#business"
                  }
                },
                "price": "600",
                "priceCurrency": "NOK"
              }
            ]
          },
          "url": "https://ks-salong.manus.space",
          "sameAs": [
            "https://www.facebook.com/p/K-s-fris%C3%B8r-100067165725839/",
            "https://www.instagram.com/k_s_frisor/"
          ]
        },
        {
          "@type": "Organization",
          "@id": "https://ks-salong.manus.space/#organization",
          "name": "K.S Frisør",
          "url": "https://ks-salong.manus.space",
          "logo": "https://ks-salong.manus.space/logo.png",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+4735555666",
            "contactType": "customer service",
            "areaServed": "NO",
            "availableLanguage": ["Norwegian", "English"]
          },
          "award": "Norgesmester 2022 i frisørfaget"
        }
      ]
    };
    
    // Add or update JSON-LD script
    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Scissors className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">K.S Frisør</span>
          </div>
          <div className="hidden md:flex gap-6">
            <a href="#om-oss" className="text-gray-700 hover:text-purple-600 transition">Om oss</a>
            <a href="#tjenester" className="text-gray-700 hover:text-purple-600 transition">Tjenester</a>
            <a href="#kontakt" className="text-gray-700 hover:text-purple-600 transition">Kontakt</a>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard-login">
              <Button size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                <Lock className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/book-online">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                Bestill time
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/salon-work.png)',
            filter: 'brightness(0.6)'
          }}
        />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-yellow-500 text-gray-900 px-4 py-2 rounded-full mb-6 font-semibold">
            <Award className="h-5 w-5" />
            Norgesmester 2022
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Velkommen til K.S Frisør
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Luksus og rimelige priser i hjertet av Porsgrunn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-online">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-6">
                Bestill time nå
              </Button>
            </Link>
            <a href="tel:+4792981628">
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white hover:bg-white/20 text-lg px-8 py-6">
                <Phone className="mr-2 h-5 w-5" />
                Ring oss
              </Button>
            </a>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-semibold">5.0 / 5.0 (55+ anmeldelser)</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-none shadow-lg hover:shadow-xl transition">
              <CardContent className="pt-8">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Norgesmester 2022</h3>
                <p className="text-gray-600">
                  Prisbelønt kvalitet fra landets beste frisører
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg hover:shadow-xl transition">
              <CardContent className="pt-8">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Herre og Dame</h3>
                <p className="text-gray-600">
                  Profesjonelle tjenester for alle
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg hover:shadow-xl transition">
              <CardContent className="pt-8">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">5 Stjerner</h3>
                <p className="text-gray-600">
                  Over 55 fornøyde kunder på Google
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="om-oss" className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-gray-900">Om K.S Frisør</h2>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                Velkommen til K.S Frisør, en ledende frisørsalong i hjertet av Porsgrunn. 
                Beliggende i Storgata 122, tilbyr denne salongen topp kvalitet hårpleietjenester 
                som har fått strålende anmeldelser fra kundene.
              </p>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                Med en imponerende gjennomsnittsvurdering på 5 av 5 fra hele 55 anmeldelser, 
                skiller K.S Frisør seg ut som et enestående valg for de som søker det beste innen hårpleie.
              </p>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                I denne moderne og stilfulle salongen serveres kundene av høyt kvalifiserte frisører 
                som er dedikerte til sitt håndverk. Vi tilbyr et bredt spekter av tjenester som spenner 
                fra klassiske klipp og farging til mer avanserte stilendringer og konsulenttjenester.
              </p>
              <Link href="/book-online">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Bestill time
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img 
                src="/images/champion-2022.png" 
                alt="K.S Frisør Interior" 
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-xl">
                <div className="text-4xl font-bold text-purple-600">15+</div>
                <div className="text-gray-600">År med erfaring</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="tjenester" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Våre Tjenester</h2>
            <p className="text-xl text-gray-600">Profesjonell hårpleie for enhver anledning</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Herreklipp",
                description: "Klassiske og moderne klipp for menn",
                icon: "✂️"
              },
              {
                title: "Dameklipp",
                description: "Stilige klipp tilpasset din personlighet",
                icon: "💇‍♀️"
              },
              {
                title: "Farge",
                description: "Profesjonell hårfarge og highlights",
                icon: "💇"
              },
              {
                title: "Skjegg trim",
                description: "Perfekt skjeggstyling og trim",
                icon: "🧔"
              },
              {
                title: "Styling",
                description: "Avanserte stilendringer og makeover",
                icon: "💫"
              },
              {
                title: "Konsultasjon",
                description: "Personlig rådgivning om hårpleie",
                icon: "💬"
              }
            ].map((service, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition hover:-translate-y-1">
                <CardContent className="pt-8">
                  <div className="text-5xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <Link href="/book-online">
                    <Button variant="outline" className="w-full">
                      Bestill nå
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Galleri</h2>
            <p className="text-xl text-gray-600">Se vårt arbeid og moderne salong</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative h-64 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
              <img src="/images/salon-work.png" alt="Salon interior" className="w-full h-full object-cover" />
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
              <img src="/images/salon-gallery-1.jpeg" alt="Customer service" className="w-full h-full object-cover" />
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
              <img src="/images/haircut-designs.png" alt="Professional haircut designs" className="w-full h-full object-cover" />
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
              <img src="/images/champion-2022.png" alt="Norgesmester 2022" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Hva kundene sier</h2>
            <p className="text-xl text-gray-600">Fornøyde kunder er vår største stolthet</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card className="border-2 border-purple-100 hover:border-purple-300 transition">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Utrolig dyktig og nøye. Veldig hyggelig mann. Utrolig jobb han gjorde med skjegget til samboeren. Rask og effektiv og så bra gjort👍"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sissel Skuggen</p>
                    <p className="text-sm text-gray-500">Google anmeldelse</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="border-2 border-purple-100 hover:border-purple-300 transition">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Beste frisøren i Porsgrunn! Alltid fornøyd med resultatet. Profesjonell service og hyggelig atmosfære."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Fornøyd kunde</p>
                    <p className="text-sm text-gray-500">Google anmeldelse</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="border-2 border-purple-100 hover:border-purple-300 transition">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Utmerket håndverk og god service. Anbefales på det sterkeste! Norgesmester med god grunn."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Lokal kunde</p>
                    <p className="text-sm text-gray-500">Google anmeldelse</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Vil du dele din opplevelse?</p>
            <Link href="/book-online">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                Book din time nå
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="kontakt" className="py-20 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold mb-6">Kontakt oss</h2>
              <p className="text-xl mb-8 text-purple-100">
                Vi ser frem til å ta vare på deg!
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Adresse</h3>
                    <p className="text-purple-100">Storgata 122C<br />3915 Porsgrunn, Norge</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Telefon</h3>
                    <a href="tel:+4792981628" className="text-purple-100 hover:text-white transition">
                      +47 929 81 628
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Åpningstider</h3>
                    <div className="text-purple-100 space-y-1">
                      <p>Mandag - Lørdag: 10:00 – 18:00</p>
                      <p>Søndag: Stengt</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link href="/book-online">
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                    Bestill time online
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg p-2 shadow-2xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2058.4!2d9.6561!3d59.1406!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTnCsDA4JzI2LjIiTiA5wrAzOScyMi4wIkU!5e0!3m2!1sen!2sno!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '400px', borderRadius: '0.5rem' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Scissors className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold text-white">K.S Frisør</span>
              </div>
              <p className="text-sm">
                Norgesmester 2022 i frisørfaget. Luksus og rimelige priser i Porsgrunn.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Hurtiglenker</h3>
              <div className="space-y-2">
                <a href="#om-oss" className="block hover:text-white transition">Om oss</a>
                <a href="#tjenester" className="block hover:text-white transition">Tjenester</a>
                <Link href="/book-online" className="block hover:text-white transition">Bestill time</Link>
                <a href="#kontakt" className="block hover:text-white transition">Kontakt</a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Følg oss</h3>
              <div className="space-y-2">
                <a href="https://www.facebook.com/p/K-s-fris%C3%B8r-100067165725839/" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition">
                  Facebook
                </a>
                <a href="https://www.instagram.com/k_s_frisor/" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition">
                  Instagram
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <div className="flex justify-center gap-4 mb-4">
                <Link href="/privacy-policy">
                <span className="hover:text-white transition cursor-pointer">Personvernerklæring</span>
              </Link>
              <span>|</span>
              <Link href="/terms-of-service">
                <span className="hover:text-white transition cursor-pointer">Vilkår for bruk</span>
              </Link>
            </div>
            <p>&copy; 2026 K.S Frisør. Alle rettigheter reservert.</p>
            <Link href="/dashboard-login">
              <button className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg">
                <Lock className="h-4 w-4" />
                Dashboard
              </button>
            </Link>
          </div>
        </div>
      </footer>
      
      {/* WhatsApp Floating Button */}
      <WhatsAppButton />
    </div>
  );
}
