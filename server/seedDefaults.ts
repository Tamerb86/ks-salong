import { getDb } from "./db";
import { services, products } from "../drizzle/schema";

/**
 * Seed default salon services and products
 * Popular Norwegian salon services and products
 */
export async function seedDefaultData() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection not available");
  }

  try {
    console.log("[SeedDefaults] Starting to seed default services and products...");

    // Default Services (Popular Norwegian Salon Services)
    const defaultServices = [
      {
        name: "Herreklipp",
        description: "Profesjonell herreklipp med vask og styling",
        duration: 30,
        price: "350.00",
        mvaTax: "25.00",
        isActive: true,
        category: "Klipping",
      },
      {
        name: "Dameklipp",
        description: "Profesjonell dameklipp med vask, klipp og føn",
        duration: 45,
        price: "450.00",
        mvaTax: "25.00",
        isActive: true,
        category: "Klipping",
      },
      {
        name: "Barneklipp",
        description: "Klipp for barn under 12 år",
        duration: 20,
        price: "250.00",
        mvaTax: "25.00",
        isActive: true,
        category: "Klipping",
      },
      {
        name: "Farging",
        description: "Helfarging av hår inkludert vask og føn",
        duration: 90,
        price: "800.00",
        mvaTax: "25.00",
        isActive: true,
        category: "Farge",
      },
      {
        name: "Highlights",
        description: "Highlights/striper med toning og styling",
        duration: 120,
        price: "1200.00",
        mvaTax: "25.00",
        isActive: true,
        category: "Farge",
      },
      {
        name: "Permanent",
        description: "Permanent krøller eller rett hår",
        duration: 90,
        price: "900.00",
        mvaTax: "25.00",
        isActive: true,
        category: "Behandling",
      },
      {
        name: "Skjegg trim",
        description: "Profesjonell skjeggtrimming og styling",
        duration: 15,
        price: "150.00",
        mvaTax: "25.00",
        isActive: true,
        category: "Skjegg",
      },
      {
        name: "Vask og føn",
        description: "Hårvask med profesjonell føning og styling",
        duration: 30,
        price: "300.00",
        mvaTax: "25.00",
        isActive: true,
        category: "Styling",
      },
      {
        name: "Bryllupsstyling",
        description: "Komplett bryllupsstyling med prøve",
        duration: 120,
        price: "1500.00",
        mvaTax: "25.00",
        isActive: true,
        category: "Styling",
      },
      {
        name: "Keratinbehandling",
        description: "Keratinbehandling for glatt og sunt hår",
        duration: 150,
        price: "1800.00",
        mvaTax: "25.00",
        isActive: true,
        category: "Behandling",
      },
    ];

    // Default Products (Popular Salon Products)
    const defaultProducts = [
      {
        name: "Shampoo Professional",
        description: "Profesjonell shampoo for daglig bruk",
        price: "250.00",
        mvaTax: "25.00",
        sku: "SHMP-001",
        stockQuantity: 50,
        isActive: true,
        category: "Hårvask",
      },
      {
        name: "Conditioner Professional",
        description: "Profesjonell balsam for alle hårtyper",
        price: "250.00",
        mvaTax: "25.00",
        sku: "COND-001",
        stockQuantity: 50,
        isActive: true,
        category: "Hårvask",
      },
      {
        name: "Hair Wax",
        description: "Styling wax for sterkt hold",
        price: "180.00",
        mvaTax: "25.00",
        sku: "WAX-001",
        stockQuantity: 30,
        isActive: true,
        category: "Styling",
      },
      {
        name: "Hair Gel",
        description: "Styling gel for ekstra sterkt hold",
        price: "180.00",
        mvaTax: "25.00",
        sku: "GEL-001",
        stockQuantity: 30,
        isActive: true,
        category: "Styling",
      },
      {
        name: "Hair Spray",
        description: "Hårspray for langvarig hold",
        price: "200.00",
        mvaTax: "25.00",
        sku: "SPRAY-001",
        stockQuantity: 40,
        isActive: true,
        category: "Styling",
      },
      {
        name: "Hair Oil Treatment",
        description: "Nærende hårolje for tørt hår",
        price: "350.00",
        mvaTax: "25.00",
        sku: "OIL-001",
        stockQuantity: 25,
        isActive: true,
        category: "Behandling",
      },
      {
        name: "Beard Oil",
        description: "Skjeggolje for mykere skjegg",
        price: "220.00",
        mvaTax: "25.00",
        sku: "BEARD-001",
        stockQuantity: 20,
        isActive: true,
        category: "Skjegg",
      },
      {
        name: "Hair Mask",
        description: "Intensiv hårkur for skadet hår",
        price: "280.00",
        mvaTax: "25.00",
        sku: "MASK-001",
        stockQuantity: 30,
        isActive: true,
        category: "Behandling",
      },
      {
        name: "Heat Protection Spray",
        description: "Varmebeskyttelse før styling",
        price: "240.00",
        mvaTax: "25.00",
        sku: "HEAT-001",
        stockQuantity: 35,
        isActive: true,
        category: "Behandling",
      },
      {
        name: "Dry Shampoo",
        description: "Tørrshampoo for friskt hår mellom vask",
        price: "190.00",
        mvaTax: "25.00",
        sku: "DRY-001",
        stockQuantity: 40,
        isActive: true,
        category: "Hårvask",
      },
    ];

    // Insert services
    let servicesInserted = 0;
    for (const service of defaultServices) {
      try {
        await db.insert(services).values(service);
        servicesInserted++;
        console.log(`[SeedDefaults] ✓ Inserted service: ${service.name}`);
      } catch (error: any) {
        // Skip if already exists
        if (error.code === "ER_DUP_ENTRY" || error.message?.includes("duplicate")) {
          console.log(`[SeedDefaults] ⊘ Service already exists: ${service.name}`);
        } else {
          console.error(`[SeedDefaults] ✗ Failed to insert service ${service.name}:`, error.message);
        }
      }
    }

    // Insert products
    let productsInserted = 0;
    for (const product of defaultProducts) {
      try {
        await db.insert(products).values(product);
        productsInserted++;
        console.log(`[SeedDefaults] ✓ Inserted product: ${product.name}`);
      } catch (error: any) {
        // Skip if already exists
        if (error.code === "ER_DUP_ENTRY" || error.message?.includes("duplicate")) {
          console.log(`[SeedDefaults] ⊘ Product already exists: ${product.name}`);
        } else {
          console.error(`[SeedDefaults] ✗ Failed to insert product ${product.name}:`, error.message);
        }
      }
    }

    console.log(`[SeedDefaults] ✅ Seeding completed!`);
    console.log(`[SeedDefaults] Services inserted: ${servicesInserted}/${defaultServices.length}`);
    console.log(`[SeedDefaults] Products inserted: ${productsInserted}/${defaultProducts.length}`);

    return {
      success: true,
      servicesInserted,
      productsInserted,
      totalServices: defaultServices.length,
      totalProducts: defaultProducts.length,
    };
  } catch (error: any) {
    console.error("[SeedDefaults] ❌ Error seeding default data:", error);
    throw error;
  }
}
