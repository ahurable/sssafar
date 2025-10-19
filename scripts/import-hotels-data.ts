import { prisma } from '@/lib/prisma'
import fs from 'fs/promises'
import path from 'path'

interface Property {
  Id: number
  Name: string
}

interface PropertyImage {
  PropertyId: number
  Images: Array<{
    Name: string
    Thumbnail: string
  }>
}

async function importHotelNames() {
  console.log('📊 Importing hotel names...')
  
  let totalImported = 0

  // Import international hotel names
  try {
    const internationalPath = path.join(process.cwd(), 'assets', 'data', 'HotelStaticData')
    const internationalFiles = await fs.readdir(internationalPath)
    const propertyFiles = internationalFiles.filter(file => /^Property_\d+-\d+\.json$/.test(file))
    
    for (const file of propertyFiles) {
      try {
        const filePath = path.join(internationalPath, file)
        const data = await fs.readFile(filePath, 'utf-8')
        const properties: Property[] = JSON.parse(data)
        
        for (const property of properties) {
          try {
            await prisma.hotel.upsert({
              where: { hotelId: property.Id },
              update: {
                name: property.Name,
                type: 'INTERNATIONAL'
              },
              create: {
                hotelId: property.Id,
                name: property.Name,
                type: 'INTERNATIONAL'
              }
            })
            totalImported++
          } catch (error) {
            if (!error.toString().includes('Unique constraint')) {
              console.error(`❌ Error importing hotel ${property.Id}:`, error)
            }
          }
        }
        console.log(`✅ Processed ${file} - ${properties.length} hotels`)
      } catch (error) {
        console.error(`❌ Error processing file ${file}:`, error)
      }
    }
  } catch (error) {
    console.error('❌ Error importing international hotels:', error)
  }

  // Import domestic hotel names
  try {
    const domesticPath = path.join(process.cwd(), 'assets', 'data', 'DomesticHotelStaticData')
    const domesticFiles = await fs.readdir(domesticPath)
    const domesticPropertyFiles = domesticFiles.filter(file => /^DomesticProperty_\d+-\d+\.json$/.test(file))
    
    for (const file of domesticPropertyFiles) {
      try {
        const filePath = path.join(domesticPath, file)
        const data = await fs.readFile(filePath, 'utf-8')
        const properties: Property[] = JSON.parse(data)
        
        for (const property of properties) {
          try {
            await prisma.hotel.upsert({
              where: { hotelId: property.Id },
              update: {
                name: property.Name,
                type: 'DOMESTIC'
              },
              create: {
                hotelId: property.Id,
                name: property.Name,
                type: 'DOMESTIC'
              }
            })
            totalImported++
          } catch (error) {
            if (!error.toString().includes('Unique constraint')) {
              console.error(`❌ Error importing domestic hotel ${property.Id}:`, error)
            }
          }
        }
        console.log(`✅ Processed ${file} - ${properties.length} domestic hotels`)
      } catch (error) {
        console.error(`❌ Error processing domestic file ${file}:`, error)
      }
    }
  } catch (error) {
    console.error('❌ Error importing domestic hotels:', error)
  }

  console.log(`🎉 Imported ${totalImported} hotel names in total`)
}

async function importHotelImages() {
  console.log('📊 Importing hotel images...')
  
  let totalImported = 0

  // Import international hotel images
  try {
    const internationalPath = path.join(process.cwd(), 'assets', 'data', 'HotelStaticData')
    const internationalFiles = await fs.readdir(internationalPath)
    const imageFiles = internationalFiles.filter(file => /^PropertyImage_\d+-\d+\.json$/.test(file))
    
    for (const file of imageFiles) {
      try {
        const filePath = path.join(internationalPath, file)
        const data = await fs.readFile(filePath, 'utf-8')
        const propertyImages: PropertyImage[] = JSON.parse(data)
        
        for (const propImage of propertyImages) {
          // Check if hotel exists
          const hotelExists = await prisma.hotel.findUnique({
            where: { hotelId: propImage.PropertyId }
          })

          if (!hotelExists) {
            console.log(`⚠️  Hotel ${propImage.PropertyId} not found, skipping images`)
            continue
          }

          for (const image of propImage.Images) {
            try {
              // Determine image type
              let type: string = 'GALLERY'
              if (image.Name.includes('main.jpg')) type = 'MAIN'
              else if (image.Name.includes('hero.jpg')) type = 'HERO'
              else if (image.Thumbnail && image.Thumbnail.includes('thumbnail')) type = 'THUMBNAIL'

              await prisma.hotelImage.create({
                data: {
                  hotelId: propImage.PropertyId,
                  imageUrl: image.Name,
                  thumbnailUrl: image.Thumbnail || null,
                  type: type as any,
                  isDomestic: false
                }
              })
              totalImported++
            } catch (error) {
              // Skip duplicate errors
              if (!error.toString().includes('Unique constraint')) {
                console.error(`❌ Error importing image for hotel ${propImage.PropertyId}:`, error)
              }
            }
          }
        }
        console.log(`✅ Processed ${file} - ${propertyImages.length} property images`)
      } catch (error) {
        console.error(`❌ Error processing image file ${file}:`, error)
      }
    }
  } catch (error) {
    console.error('❌ Error importing international hotel images:', error)
  }

  // Import domestic hotel images
  try {
    const domesticPath = path.join(process.cwd(), 'assets', 'data', 'DomesticHotelStaticData')
    const domesticFiles = await fs.readdir(domesticPath)
    const domesticImageFiles = domesticFiles.filter(file => /^DomesticPropertyImage_\d+-\d+\.json$/.test(file))
    
    for (const file of domesticImageFiles) {
      try {
        const filePath = path.join(domesticPath, file)
        const data = await fs.readFile(filePath, 'utf-8')
        const propertyImages: PropertyImage[] = JSON.parse(data)
        
        for (const propImage of propertyImages) {
          // Check if hotel exists
          const hotelExists = await prisma.hotel.findUnique({
            where: { hotelId: propImage.PropertyId }
          })

          if (!hotelExists) {
            console.log(`⚠️  Domestic hotel ${propImage.PropertyId} not found, skipping images`)
            continue
          }

          for (const image of propImage.Images) {
            try {
              // Determine image type
              let type: string = 'GALLERY'
              if (image.Name.includes('main.jpg')) type = 'MAIN'
              else if (image.Name.includes('hero.jpg')) type = 'HERO'
              else if (image.Thumbnail && image.Thumbnail.includes('thumbnail')) type = 'THUMBNAIL'

              await prisma.hotelImage.create({
                data: {
                  hotelId: propImage.PropertyId,
                  imageUrl: image.Name,
                  thumbnailUrl: image.Thumbnail || null,
                  type: type as any,
                  isDomestic: true
                }
              })
              totalImported++
            } catch (error) {
              // Skip duplicate errors
              if (!error.toString().includes('Unique constraint')) {
                console.error(`❌ Error importing domestic image for hotel ${propImage.PropertyId}:`, error)
              }
            }
          }
        }
        console.log(`✅ Processed ${file} - ${propertyImages.length} domestic property images`)
      } catch (error) {
        console.error(`❌ Error processing domestic image file ${file}:`, error)
      }
    }
  } catch (error) {
    console.error('❌ Error importing domestic hotel images:', error)
  }

  console.log(`🎉 Imported ${totalImported} hotel images in total`)
}

async function main() {
  console.log('🚀 Starting hotel names and images import...')
  
  try {
    await importHotelNames()
    await importHotelImages()
    
    console.log('🎉 Hotel names and images import completed successfully!')
    
    // Print some stats
    const hotelCount = await prisma.hotel.count()
    const imageCount = await prisma.hotelImage.count()
    console.log(`📊 Database stats: ${hotelCount} hotels, ${imageCount} images`)
    
  } catch (error) {
    console.error('💥 Error during hotel data import:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()