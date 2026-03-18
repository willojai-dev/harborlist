const { getDb } = require("./index");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

// Use Unsplash source URLs directly — no download needed, served from CDN
const PHOTOS = {
  sail_large:   "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&q=80",
  sail_med:     "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800&q=80",
  sail_small:   "https://images.unsplash.com/photo-1541956064527-0b5b0fd7cfe3?w=800&q=80",
  sail_race:    "https://images.unsplash.com/photo-1537824598505-99e2c4761e89?w=800&q=80",
  sail_ocean:   "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80",
  sail_harbor:  "https://images.unsplash.com/photo-1559523161-0fc0d8b814e1?w=800&q=80",
  sail_sunset:  "https://images.unsplash.com/photo-1500514966906-fe246eea8f91?w=800&q=80",
  motor_sport:  "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800&q=80",
  motor_fish:   "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80",
  marina:       "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
  catamaran:    "https://images.unsplash.com/photo-1520454974749-611e0df64d27?w=800&q=80",
  yacht:        "https://images.unsplash.com/photo-1577032229840-33197764440d?w=800&q=80",
};

async function seed() {
  const db = await getDb();
  console.log("Seeding database...");

  await db.exec("DELETE FROM messages");
  await db.exec("DELETE FROM listing_photos");
  await db.exec("DELETE FROM listings");
  await db.exec("DELETE FROM users");

  const users = [
    { id: uuidv4(), name: "Captain James R.", email: "james@example.com", phone: "(305) 555-0182", password: bcrypt.hashSync("password123", 10) },
    { id: uuidv4(), name: "Mark Davis", email: "mark@example.com", phone: "(954) 555-0217", password: bcrypt.hashSync("password123", 10) },
    { id: uuidv4(), name: "Linda Chen", email: "linda@example.com", phone: "(619) 555-0334", password: bcrypt.hashSync("password123", 10) },
    { id: uuidv4(), name: "Bob Williams", email: "bob@example.com", phone: "(843) 555-0401", password: bcrypt.hashSync("password123", 10) },
    { id: uuidv4(), name: "Mike Torres", email: "mike@example.com", phone: "(805) 555-0112", password: bcrypt.hashSync("password123", 10) },
    { id: uuidv4(), name: "Sarah Navarro", email: "sarah@example.com", phone: "(805) 555-0198", password: bcrypt.hashSync("password123", 10) },
  ];
  for (const u of users) {
    await db.run("INSERT INTO users (id,name,email,password,phone) VALUES (?,?,?,?,?)", [u.id, u.name, u.email, u.password, u.phone]);
  }

  const listings = [
    { id: uuidv4(), user_id: users[0].id, name: "Sea Phantom 42", type: "Sailboat", price: 189000, length: 42, beam: 13.2, draft: 6.0, year: 2019, location: "Miami, FL", lat: 25.77, lng: -80.19, condition: "Excellent", engine_make: "Yanmar", engine_model: "4JH45", total_power: "45hp", fuel_type: "Diesel", engine_hours: 320, hull_material: "Fiberglass", fuel_tank: 50, water_tank: 80, category: "Cruiser", description: "A stunning offshore cruiser in exceptional condition. Blue water ready with all upgrades. New sails 2022, AIS, chartplotter, watermaker.", status: "active", photos: [PHOTOS.sail_large, PHOTOS.sail_ocean] },
    { id: uuidv4(), user_id: users[1].id, name: "Marlin Hunter 28", type: "Motorboat", price: 74500, length: 28, beam: 10.0, draft: 2.5, year: 2021, location: "Fort Lauderdale, FL", lat: 26.12, lng: -80.14, condition: "Like New", engine_make: "Yamaha", engine_model: "F300", total_power: "600hp", fuel_type: "Gasoline", engine_hours: 48, hull_material: "Fiberglass", fuel_tank: 180, water_tank: 30, capacity: 8, category: "Sport Fishing", description: "Barely used sport fishing boat with full electronics package and outriggers. Less than 50 hours on engines.", status: "active", photos: [PHOTOS.motor_fish, PHOTOS.motor_sport] },
    { id: uuidv4(), user_id: users[2].id, name: "Catalina 36 MkII", type: "Sailboat", price: 112000, length: 36, beam: 12.0, draft: 5.5, year: 2016, location: "San Diego, CA", lat: 32.72, lng: -117.16, condition: "Good", engine_make: "Westerbeke", engine_model: "27hp", total_power: "27hp", fuel_type: "Diesel", engine_hours: 1200, hull_material: "Fiberglass", fuel_tank: 30, water_tank: 60, category: "Cruiser", description: "Classic Catalina with updated sails, new standing rigging, and upgraded electronics. Dodger and bimini new in 2021.", status: "active", photos: [PHOTOS.sail_med, PHOTOS.marina] },
    { id: uuidv4(), user_id: users[3].id, name: "Grady-White Canyon 336", type: "Motorboat", price: 245000, length: 33, beam: 11.5, draft: 2.0, year: 2022, location: "Charleston, SC", lat: 32.78, lng: -79.93, condition: "Excellent", engine_make: "Yamaha", engine_model: "F350", total_power: "1050hp", fuel_type: "Gasoline", engine_hours: 120, hull_material: "Fiberglass", fuel_tank: 280, water_tank: 20, capacity: 10, category: "Sport Fishing", description: "Top-of-the-line offshore fishing machine. Tournament ready with Simrad electronics, tuna door, and custom tower.", status: "active", photos: [PHOTOS.motor_sport, PHOTOS.motor_fish] },
    { id: uuidv4(), user_id: users[0].id, name: "Island Packet 380", type: "Sailboat", price: 165000, length: 38, beam: 13.0, draft: 5.0, year: 2014, location: "Annapolis, MD", lat: 38.97, lng: -76.49, condition: "Good", engine_make: "Yanmar", engine_model: "4JH3-TE", total_power: "75hp", fuel_type: "Diesel", engine_hours: 2800, hull_material: "Fiberglass", fuel_tank: 78, water_tank: 100, category: "Bluewater Cruiser", description: "Ocean proven bluewater cruiser. Has completed two Atlantic crossings. Watermaker, SSB radio, and sat phone included.", status: "active", photos: [PHOTOS.sail_ocean, PHOTOS.sail_sunset] },
    { id: uuidv4(), user_id: users[1].id, name: "Boston Whaler 270 Dauntless", type: "Motorboat", price: 88000, length: 27, beam: 9.6, draft: 1.8, year: 2020, location: "Newport, RI", lat: 41.49, lng: -71.31, condition: "Excellent", engine_make: "Mercury", engine_model: "Verado 150", total_power: "300hp", fuel_type: "Gasoline", engine_hours: 210, hull_material: "Fiberglass", fuel_tank: 100, water_tank: 15, capacity: 10, category: "Bowrider", description: "Unsinkable Whaler in pristine shape. Full canvas, Garmin electronics, and trailer included.", status: "active", photos: [PHOTOS.motor_sport, PHOTOS.marina] },
    { id: uuidv4(), user_id: users[2].id, name: "Hunter 45DS", type: "Sailboat", price: 210000, length: 45, beam: 14.2, draft: 5.5, year: 2018, location: "Seattle, WA", lat: 47.60, lng: -122.33, condition: "Excellent", engine_make: "Yanmar", engine_model: "4JH57", total_power: "55hp", fuel_type: "Diesel", engine_hours: 680, hull_material: "Fiberglass", fuel_tank: 60, water_tank: 120, category: "Cruiser", description: "Dual-stateroom bluewater cruiser. Perfect liveaboard or charter vessel.", status: "active", photos: [PHOTOS.sail_harbor, PHOTOS.marina] },
    { id: uuidv4(), user_id: users[3].id, name: "Pursuit S 408 Sport", type: "Motorboat", price: 320000, length: 40, beam: 13.0, draft: 2.8, year: 2023, location: "Naples, FL", lat: 26.14, lng: -81.79, condition: "Like New", engine_make: "Yamaha", engine_model: "F425", total_power: "1275hp", fuel_type: "Gasoline", engine_hours: 12, hull_material: "Fiberglass", fuel_tank: 360, water_tank: 40, capacity: 12, category: "Sport Yacht", description: "Brand new 2023 with full factory warranty. Garmin electronics suite, bow thruster, and generator.", status: "active", photos: [PHOTOS.yacht, PHOTOS.motor_sport] },
    { id: uuidv4(), user_id: users[4].id, name: "Pacific Wanderer 34", type: "Sailboat", price: 68000, length: 34, beam: 11.5, draft: 5.5, year: 2011, location: "Ventura Harbor, CA", lat: 34.228, lng: -119.274, condition: "Good", engine_make: "Yanmar", engine_model: "3YM30", total_power: "27hp", fuel_type: "Diesel", engine_hours: 1450, hull_material: "Fiberglass", fuel_tank: 28, water_tank: 50, category: "Cruiser", description: "Well-maintained coastal cruiser at Ventura Harbor for 8 years. New standing rigging 2022, upgraded chartplotter, full canvas.", status: "active", photos: [PHOTOS.sail_med, PHOTOS.sail_harbor] },
    { id: uuidv4(), user_id: users[4].id, name: "Beneteau Oceanis 35.1", type: "Sailboat", price: 145000, length: 35, beam: 11.8, draft: 5.9, year: 2017, location: "Ventura Harbor, CA", lat: 34.229, lng: -119.275, condition: "Excellent", engine_make: "Volvo", engine_model: "D1-20", total_power: "21hp", fuel_type: "Diesel", engine_hours: 520, hull_material: "Fiberglass", fuel_tank: 26, water_tank: 53, category: "Racer-Cruiser", description: "Beautiful modern racer-cruiser in excellent condition. New bottom paint 2024, upgraded electronics, full offshore safety gear.", status: "active", photos: [PHOTOS.sail_race, PHOTOS.sail_sunset] },
    { id: uuidv4(), user_id: users[5].id, name: "Catalina 30 Tall Rig", type: "Sailboat", price: 38500, length: 30, beam: 10.8, draft: 5.5, year: 1998, location: "Ventura Harbor, CA", lat: 34.227, lng: -119.273, condition: "Good", engine_make: "Universal", engine_model: "M-25XP", total_power: "25hp", fuel_type: "Gasoline", engine_hours: 3200, hull_material: "Fiberglass", fuel_tank: 22, water_tank: 35, category: "Cruiser", description: "Classic Catalina 30 with tall rig, freshly serviced engine, new sails 2021. Perfect entry-level bluewater boat.", status: "active", photos: [PHOTOS.sail_small, PHOTOS.marina] },
    { id: uuidv4(), user_id: users[5].id, name: "Jeanneau Sun Odyssey 40", type: "Sailboat", price: 118000, length: 40, beam: 13.1, draft: 6.2, year: 2013, location: "Ventura Harbor, CA", lat: 34.230, lng: -119.276, condition: "Excellent", engine_make: "Yanmar", engine_model: "4JH4-TE", total_power: "40hp", fuel_type: "Diesel", engine_hours: 1100, hull_material: "Fiberglass", fuel_tank: 45, water_tank: 90, category: "Cruiser", description: "Spacious French-built cruiser with 3 cabins and 2 heads. Furling main, self-tacking jib, AIS, autopilot, and watermaker.", status: "active", photos: [PHOTOS.sail_large, PHOTOS.sail_ocean] },
    { id: uuidv4(), user_id: users[4].id, name: "Corsair F-28R Trimaran", type: "Sailboat", price: 52000, length: 28, beam: 19.0, draft: 2.0, year: 2005, location: "Channel Islands Harbor, CA", lat: 34.153, lng: -119.220, condition: "Good", engine_make: "Tohatsu", engine_model: "9.9hp", total_power: "9.9hp", fuel_type: "Gasoline", engine_hours: 380, hull_material: "Fiberglass/Carbon", fuel_tank: 6, water_tank: 10, category: "Multihull", description: "Fast folding trimaran. Makes 20+ knots in good breeze. Regularly sails to the Channel Islands in under 2 hours.", status: "active", photos: [PHOTOS.catamaran, PHOTOS.sail_race] },
    { id: uuidv4(), user_id: users[5].id, name: "Ranger 29", type: "Sailboat", price: 22000, length: 29, beam: 9.5, draft: 5.0, year: 1977, location: "Channel Islands Harbor, CA", lat: 34.154, lng: -119.221, condition: "Fair", engine_make: "Atomic 4", engine_model: "Rebuilt 2020", total_power: "30hp", fuel_type: "Gasoline", engine_hours: 500, hull_material: "Fiberglass", fuel_tank: 20, water_tank: 25, category: "Racer-Cruiser", description: "Classic Southern California racer-cruiser. Recently rebuilt engine, good sails, strong racing history. Priced to sell.", status: "active", photos: [PHOTOS.sail_small, PHOTOS.sail_harbor] },
    { id: uuidv4(), user_id: users[4].id, name: "Catalina 42 MkII", type: "Sailboat", price: 178000, length: 42, beam: 13.8, draft: 5.5, year: 2001, location: "Channel Islands Harbor, CA", lat: 34.152, lng: -119.219, condition: "Excellent", engine_make: "Perkins", engine_model: "4-236 Diesel", total_power: "50hp", fuel_type: "Diesel", engine_hours: 3400, hull_material: "Fiberglass", fuel_tank: 55, water_tank: 100, category: "Bluewater Cruiser", description: "Beautifully maintained center cockpit cruiser. Two staterooms, two heads, generator, watermaker, SSB radio. Has cruised to Mexico twice.", status: "active", photos: [PHOTOS.sail_harbor, PHOTOS.marina] },
  ];

  const cols = "id,user_id,name,type,price,length,beam,draft,year,location,lat,lng,condition,engine_make,engine_model,total_power,fuel_type,engine_hours,hull_material,fuel_tank,water_tank,category,description,status";
  const placeholders = cols.split(",").map(() => "?").join(",");

  for (const l of listings) {
    await db.run(`INSERT INTO listings (${cols}) VALUES (${placeholders})`, [
      l.id, l.user_id, l.name, l.type, l.price, l.length, l.beam||null, l.draft||null,
      l.year, l.location, l.lat||null, l.lng||null, l.condition,
      l.engine_make||null, l.engine_model||null, l.total_power||null, l.fuel_type||null,
      l.engine_hours||null, l.hull_material||null, l.fuel_tank||null, l.water_tank||null,
      l.category||null, l.description||null, l.status
    ]);

    // Store Unsplash URLs directly as "filenames" — served via CDN, no upload needed
    for (let i = 0; i < l.photos.length; i++) {
      await db.run(
        "INSERT INTO listing_photos (id,listing_id,filename,is_primary,sort_order) VALUES (?,?,?,?,?)",
        [uuidv4(), l.id, l.photos[i], i === 0 ? 1 : 0, i]
      );
    }
  }

  console.log(`✅ Seeded ${users.length} users and ${listings.length} listings with CDN photos`);
  users.forEach(u => console.log(`  ${u.email} / password123`));
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
