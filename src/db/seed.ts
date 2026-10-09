import { db } from "./index";
import { vehicles, tickets } from "./schema";

async function main() {
  console.log("Seeding started...");

  // Check if vehicles already exist
  const existingVehicles = await db.select().from(vehicles);
  if (existingVehicles.length === 0) {
    await db.insert(vehicles).values([
      {
        licensePlate: "K-LM 2026",
        model: "Ford Transit 2.0 TDCi (L2H2)",
        driver: "Max Mustermann (Obermonteur SHK)",
        nextHu: "2026-11",
        mileage: 42500,
        status: "Bereit",
        tireStatus: "Allwetterreifen - Profil 5.5mm (In Ordnung)",
      },
      {
        licensePlate: "K-XY 4890",
        model: "VW Crafter Kastenwagen 140 PS",
        driver: "Thomas Müller (Techniker Elektro)",
        nextHu: "2026-05", // Coming up soon!
        mileage: 89400,
        status: "Aktion erforderlich", // Needs action (HU and new tires soon)
        tireStatus: "Winterreifen - Profil 2.1mm (Kritisch - Austauschen!)",
      },
      {
        licensePlate: "K-AB 1234",
        model: "Mercedes-Benz Sprinter 314 CDI",
        driver: "Dieter Albers (Projektleiter)",
        nextHu: "2026-08",
        mileage: 112000,
        status: "In Werkstatt", // In workshop
        tireStatus: "Sommerreifen - Profil 4.2mm (In Ordnung)",
      },
      {
        licensePlate: "K-LE 9911",
        model: "Renault Kangoo Rapid dCi 95",
        driver: "Sabine Becker (Kundenservice)",
        nextHu: "2026-12",
        mileage: 21500,
        status: "Bereit",
        tireStatus: "Allwetterreifen - Profil 6.0mm (Hervorragend)",
      },
    ]);
    console.log("Seeded 4 default vehicles.");
  }

  // Check if tickets already exist
  const existingTickets = await db.select().from(tickets);
  if (existingTickets.length === 0) {
    await db.insert(tickets).values([
      {
        licensePlate: "K-AB 1234",
        vehicleModel: "Mercedes-Benz Sprinter 314 CDI",
        issue: "Klopfende Geräusche an der Vorderachse beim Einlenken und Abbremsen.",
        priority: "Hoch",
        status: "Werkstatt koordiniert",
        contactName: "Dieter Albers",
        contactPhone: "+49 172 1234567",
        contactEmail: "d.albers@schmidt-shk.de",
        adminNotes: "Lotys Fleet Manager Notiz: Schaden bei Autohaus Müller angemeldet. Ersatz-Transporter (Sprinter) für Herrn Albers reserviert. Fahrzeug-Abholung am Montag um 07:30 Uhr organisiert. Kostenvoranschlag (520€ - Querlenker) erhalten und gemäß Freigabegrenze freigegeben, Kunde wurde per WhatsApp informiert.",
      },
      {
        licensePlate: "K-XY 4890",
        vehicleModel: "VW Crafter Kastenwagen 140 PS",
        issue: "Inspektion fällig in 1500km laut Serviceanzeige. Zusätzlich müssen die Vorderreifen wegen Verschleiß getauscht werden.",
        priority: "Medium",
        status: "Neu",
        contactName: "Thomas Müller",
        contactPhone: "+49 176 9876543",
        contactEmail: "t.mueller@schmidt-shk.de",
        adminNotes: "Lotys Fleet Manager Notiz: Ticket empfangen. Wir holen gerade 3 Angebote bei kooperierenden Reifenpartnern in Köln ein, um die Kosten für die 2 Reifen zu minimieren (Zielpreis < 220€ incl. Montage). HU/AU wird direkt mit der Inspektion kombiniert.",
      }
    ]);
    console.log("Seeded 2 default tickets.");
  }

  console.log("Seeding finished successfully!");
}

main().catch((err) => {
  console.error("Error during seeding:", err);
  process.exit(1);
});
