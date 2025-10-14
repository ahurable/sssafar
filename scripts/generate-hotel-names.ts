// scripts/generate-hotel-names.ts
import fs from 'fs/promises';
import path from 'path';

interface Property {
  Id: number;
  Name: string;
}

async function generateHotelNamesMapping() {
  const basePath = path.join(process.cwd(), 'assets', 'data');
  const internationalPath = path.join(basePath, 'HotelStaticData');
  const domesticPath = path.join(basePath, 'DomesticHotelStaticData');

  const hotelNames: Record<number, string> = {};

  console.log('Starting hotel names mapping generation...');

  // Process international properties
  try {
    const internationalFiles = await fs.readdir(internationalPath);
    const internationalPropertyFiles = internationalFiles.filter(file => 
      /^Property_\d+-\d+\.json$/.test(file)
    );

    console.log(`Found ${internationalPropertyFiles.length} international property files`);

    for (const file of internationalPropertyFiles) {
      const filePath = path.join(internationalPath, file);
      console.log(`Processing ${file}...`);
      
      const data = await fs.readFile(filePath, 'utf-8');
      const properties: Property[] = JSON.parse(data);
      
      properties.forEach(prop => {
        hotelNames[prop.Id] = prop.Name;
      });
      
      console.log(`Processed ${file}, added ${properties.length} hotels`);
    }
  } catch (error) {
    console.error('Error processing international properties:', error);
  }

  // Process domestic properties
  try {
    const domesticFiles = await fs.readdir(domesticPath);
    const domesticPropertyFiles = domesticFiles.filter(file => 
      /^DomesticProperty_\d+-\d+\.json$/.test(file)
    );

    console.log(`Found ${domesticPropertyFiles.length} domestic property files`);

    for (const file of domesticPropertyFiles) {
      const filePath = path.join(domesticPath, file);
      console.log(`Processing ${file}...`);
      
      const data = await fs.readFile(filePath, 'utf-8');
      const properties: Property[] = JSON.parse(data);
      
      properties.forEach(prop => {
        hotelNames[prop.Id] = prop.Name;
      });
      
      console.log(`Processed ${file}, added ${properties.length} hotels`);
    }
  } catch (error) {
    console.error('Error processing domestic properties:', error);
  }

  // Create the assets/data directory if it doesn't exist
  const outputDir = path.join(process.cwd(), 'assets', 'data');
  try {
    await fs.access(outputDir);
  } catch {
    await fs.mkdir(outputDir, { recursive: true });
  }

  // Save the mapping
  const outputPath = path.join(outputDir, 'hotel-names-mapping.json');
  await fs.writeFile(outputPath, JSON.stringify(hotelNames, null, 2));
  
  console.log(`✅ Successfully generated mapping for ${Object.keys(hotelNames).length} hotels`);
  console.log(`📁 File saved to: ${outputPath}`);
}

generateHotelNamesMapping().catch(console.error);