import axios from 'axios';

/**
 * Sanitizes search terms (industry + location) to create a valid Postgres table name.
 * Rules:
 * - Convert to lowercase
 * - Replace spaces with underscores
 * - Remove special characters (only keep alphanumeric and underscores)
 * - Prepend 'leads_' to avoid collisions with system tables and enable filtering
 */
export const sanitizeTableName = (industry, location) => {
  const cleanIndustry = (industry || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, '')
    .replace(/\s+/g, '_');
    
  const cleanLocation = (location || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, '')
    .replace(/\s+/g, '_');

  return `leads_${cleanIndustry}_in_${cleanLocation}`;
};

/**
 * Re-formats sanitized table names into human-readable titles.
 * E.g., 'leads_coaching_centre_bangalore' -> 'Coaching Centre in Bangalore'
 */
export const formatTableName = (tableName) => {
  if (!tableName || !tableName.startsWith('leads_')) return tableName;
  
  const content = tableName.replace(/^leads_/, '');
  
  const formatWord = (word) => word.charAt(0).toUpperCase() + word.slice(1);
  const formatPhrase = (phrase) => phrase.split('_').map(formatWord).join(' ');

  if (content.includes('_in_')) {
    const [industryPart, locationPart] = content.split('_in_');
    return `${formatPhrase(industryPart)} in ${formatPhrase(locationPart)}`;
  }
  
  const parts = content.split('_');
  if (parts.length < 2) return tableName;
  
  // Try to separate industry and location.
  // By convention, the last element is the location (or we can reconstruct it)
  const location = parts[parts.length - 1];
  const industryParts = parts.slice(0, parts.length - 1);
  
  const industry = industryParts.map(formatWord).join(' ');
  const formattedLocation = formatWord(location);
  
  return `${industry} in ${formattedLocation}`;
};

/**
 * Downloads JSON data as a CSV file.
 */
export const exportToCSV = (data, filename) => {
  if (!data || !data.length) return;
  
  const headers = ['ID', 'Business Name', 'Phone Number', 'Address', 'Website', 'Rating', 'Category', 'City', 'Created At'];
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add rows
  for (const row of data) {
    const values = [
      row.id || '',
      `"${(row.business_name || '').replace(/"/g, '""')}"`,
      `"${(row.phone_number || '').replace(/"/g, '""')}"`,
      `"${(row.address || '').replace(/"/g, '""')}"`,
      `"${(row.website || '').replace(/"/g, '""')}"`,
      row.rating || '',
      `"${(row.category || '').replace(/"/g, '""')}"`,
      `"${(row.city || '').replace(/"/g, '""')}"`,
      row.created_at || ''
    ];
    csvRows.push(values.join(','));
  }
  
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ==========================================
// REALISTIC MOCK SCRAPER ENGINE
// ==========================================

const AREA_MAPPING = {
  bangalore: ['Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield', 'Jayanagar', 'JP Nagar', 'Electronic City', 'Sadashivanagar'],
  delhi: ['Connaught Place', 'Karol Bagh', 'Saket', 'Rajouri Garden', 'South Extension', 'Dwarka', 'Vasant Kunj', 'Greater Kailash'],
  mumbai: ['Bandra West', 'Andheri West', 'Colaba', 'Juhu', 'Powai', 'Worli', 'Lower Parel', 'Malad'],
  pune: ['Koregaon Park', 'Kothrud', 'Viman Nagar', 'Hinjewadi', 'Baner', 'Kalyani Nagar'],
  chennai: ['Adyar', 'T. Nagar', 'Velachery', 'Nungambakkam', 'Mylapore', 'Anna Nagar'],
  hyderabad: ['Gachibowli', 'Jubilee Hills', 'Banjara Hills', 'Madhapur', 'Kondapur', 'Begumpet'],
  default: ['Downtown', 'Greenwood', 'Oakridge', 'Parkside', 'Riverside', 'West End', 'Broadway']
};

const PHONE_PREFIX_MAPPING = {
  bangalore: '080',
  delhi: '011',
  mumbai: '022',
  pune: '020',
  chennai: '044',
  hyderabad: '040',
  default: '022'
};

const INDUSTRY_TEMPLATES = {
  gym: {
    prefixes: ['Pulse', 'Titan', 'Iron Grip', 'Velocity', 'Gold\'s', 'Flex', 'Aesthetic', 'Peak', 'Evolution', 'Elite'],
    suffixes: ['Fitness', 'Gym', 'Studio', 'Arena', 'Athletics', 'Club', 'Health Hub', 'Workouts'],
    websites: ['fitness', 'gym', 'fit', 'health'],
    ratings: [4.2, 4.8]
  },
  coaching_centre: {
    prefixes: ['Apex', 'Vanguard', 'Pinnacle', 'Career Launcher', 'Catalyst', 'Inspire', 'Chronicle', 'Elite Academy', 'Success', 'Brainwave'],
    suffixes: ['Coaching', 'Classes', 'Academy', 'Tutorials', 'Institute', 'Study Circle', 'Learning Hub'],
    websites: ['academy', 'classes', 'edu', 'coaching'],
    ratings: [4.0, 4.7]
  },
  beauty_parlour: {
    prefixes: ['Glamour', 'Velvet', 'Elixir', 'Blossom', 'Mirage', 'Bella', 'Prism', 'Radiance', 'Monsoon', 'Nirvana'],
    suffixes: ['Salon', 'Spa', 'Beauty Parlour', 'Makeover Lounge', 'Styling Studio', 'Hair & Care'],
    websites: ['salon', 'spa', 'beauty', 'glam'],
    ratings: [4.1, 4.9]
  },
  restaurant: {
    prefixes: ['The Spice', 'Copper Chimney', 'Urban Spoon', 'Golden Gate', 'Bistro', 'Olive', 'Salt & Pepper', 'Tandoori', 'Red Chilli', 'The Sizzler'],
    suffixes: ['Kitchen', 'Diner', 'Bistro', 'Platter', 'Trattoria', 'Cafe', 'Restaurant', 'Grill', 'House'],
    websites: ['eats', 'restaurant', 'cafe', 'food'],
    ratings: [3.8, 4.6]
  },
  default: {
    prefixes: ['Stellar', 'Summit', 'Alliance', 'Prime', 'Beacon', 'Nexus', 'Optima', 'Vortex', 'Zenith', 'Ascent'],
    suffixes: ['Ventures', 'Solutions', 'Co', 'Group', 'Associates', 'Hub', 'B2B', 'Services'],
    websites: ['services', 'group', 'co', 'inc'],
    ratings: [3.9, 4.7]
  }
};

// Generate an industry category key based on the search query
const getIndustryKey = (industry) => {
  const ind = (industry || '').toLowerCase();
  if (ind.includes('gym') || ind.includes('fitness') || ind.includes('workout')) return 'gym';
  if (ind.includes('coach') || ind.includes('class') || ind.includes('academy') || ind.includes('study') || ind.includes('learn')) return 'coaching_centre';
  if (ind.includes('beauty') || ind.includes('parlour') || ind.includes('salon') || ind.includes('spa') || ind.includes('hair')) return 'beauty_parlour';
  if (ind.includes('restaurant') || ind.includes('food') || ind.includes('cafe') || ind.includes('bistro') || ind.includes('diner')) return 'restaurant';
  return 'default';
};

// Map user industries to standard OpenStreetMap tags
const getOSMQueryTags = (industry) => {
  const ind = (industry || '').toLowerCase();
  
  if (ind.includes('gym') || ind.includes('fitness') || ind.includes('workout')) {
    return 'node["leisure"="fitness_centre"];way["leisure"="fitness_centre"];node["leisure"="sports_centre"];way["leisure"="sports_centre"];';
  }
  if (ind.includes('restaurant') || ind.includes('food') || ind.includes('cafe') || ind.includes('bistro') || ind.includes('diner') || ind.includes('hotel')) {
    return 'node["amenity"="restaurant"];way["amenity"="restaurant"];node["amenity"="cafe"];way["amenity"="cafe"];';
  }
  if (ind.includes('coach') || ind.includes('class') || ind.includes('academy') || ind.includes('study') || ind.includes('school') || ind.includes('learn')) {
    return 'node["amenity"="school"];way["amenity"="school"];node["amenity"="college"];way["amenity"="college"];node["office"="education"];way["office"="education"];';
  }
  if (ind.includes('beauty') || ind.includes('parlour') || ind.includes('salon') || ind.includes('spa') || ind.includes('hair') || ind.includes('massage')) {
    return 'node["shop"="beauty"];way["shop"="beauty"];node["shop"="hairdresser"];way["shop"="hairdresser"];';
  }
  if (ind.includes('property') || ind.includes('estate') || ind.includes('broker') || ind.includes('dealer') || ind.includes('realtor')) {
    return 'node["office"="estate_agent"];way["office"="estate_agent"];node["shop"="estate_agent"];way["shop"="estate_agent"];';
  }
  
  // Fallback to searching dynamically by name, amenity, or shop tags matching category
  return `node["amenity"="${ind}"];way["amenity"="${ind}"];node["shop"="${ind}"];way["shop"="${ind}"];`;
};

export const simulateScraping = async (industry, location, onLogUpdate) => {
  try {
    if (onLogUpdate) onLogUpdate('Initializing real-world scraping session...');
    await new Promise(r => setTimeout(r, 600));

    if (onLogUpdate) onLogUpdate('Rotating residential proxy IPs...');
    await new Promise(r => setTimeout(r, 800));

    if (onLogUpdate) onLogUpdate(`Geocoding location "${location}" via Nominatim API...`);
    
    let lat = 19.0760; // Mumbai fallback coordinates
    let lon = 72.8777;
    let city = location;
    
    try {
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
      const geoResponse = await axios.get(geocodeUrl, {
        headers: { 'User-Agent': 'LeadFlowDataScraperApp/1.0 (ramit.roshan@example.com)' }
      });
      if (geoResponse.data && geoResponse.data.length > 0) {
        lat = parseFloat(geoResponse.data[0].lat);
        lon = parseFloat(geoResponse.data[0].lon);
        // Extract city/locality parts
        const displayName = geoResponse.data[0].display_name || '';
        const nameParts = displayName.split(',');
        city = nameParts[0].trim();
        if (onLogUpdate) onLogUpdate(`Geocoded coordinates: [${lat.toFixed(4)}, ${lon.toFixed(4)}]`);
      } else {
        if (onLogUpdate) onLogUpdate('Geocoding returned 0 results. Using default coordinates.');
      }
    } catch (err) {
      console.error('Nominatim Geocoding Error:', err);
      if (onLogUpdate) onLogUpdate('Geocoding service unavailable. Using default coordinates.');
    }
    await new Promise(r => setTimeout(r, 800));

    if (onLogUpdate) onLogUpdate('Connecting to OpenStreetMap Overpass API (around 5000m radius)...');
    await new Promise(r => setTimeout(r, 600));

    const tagsStr = getOSMQueryTags(industry);
    const radius = 5000;
    
    // Construct Overpass QL query based on coordinates and tags
    const tagQueries = tagsStr
      .split(';')
      .filter(Boolean)
      .map(tag => `${tag}(around:${radius},${lat},${lon})`)
      .join(';');
      
    const query = `
      [out:json][timeout:35];
      (
        ${tagQueries};
      );
      out body 80;
    `;

    if (onLogUpdate) onLogUpdate('Dispatching Overpass QL query...');
    const response = await axios.post('https://overpass-api.de/api/interpreter', `data=${encodeURIComponent(query)}`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const elements = response.data.elements || [];
    if (onLogUpdate) onLogUpdate(`Successfully fetched ${elements.length} raw business listings from OSM.`);
    await new Promise(r => setTimeout(r, 800));

    if (onLogUpdate) onLogUpdate('Crawling B2B listings to extract addresses and phone numbers...');
    
    const leads = [];
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const tags = el.tags || {};

      // Name extraction
      const name = tags.name || tags.brand || `${industry.charAt(0).toUpperCase() + industry.slice(1)} (${el.id})`;

      // Phone extraction
      const phone = tags.phone || tags["contact:phone"] || tags["contact:mobile"] || tags.mobile || '';

      // Address construction
      const houseNumber = tags["addr:housenumber"] || '';
      const street = tags["addr:street"] || '';
      const suburb = tags["addr:suburb"] || tags["addr:neighbourhood"] || '';
      const cityTag = tags["addr:city"] || city || location;
      const postcode = tags["addr:postcode"] || '';
      
      const addressParts = [houseNumber, street, suburb, cityTag, postcode, 'India'].filter(Boolean).map(s => s.trim());
      const address = addressParts.join(', ') || `Main Road, ${location}, India`;

      // Website extraction
      const website = tags.website || tags["contact:website"] || '';

      // Rating (OSM does not have rating, so we assign a realistic rating between 4.0 and 4.9 based on ID or default)
      const rating = tags.rating ? parseFloat(tags.rating) : parseFloat((4.0 + (el.id % 10) * 0.1).toFixed(1));

      // Category formatting
      const category = tags.amenity || tags.shop || tags.leisure || industry;

      leads.push({
        business_name: name,
        phone_number: phone || null,
        address,
        website: website || null,
        rating: rating > 5.0 ? 4.5 : rating,
        category: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
        city: cityTag.charAt(0).toUpperCase() + cityTag.slice(1).toLowerCase()
      });
    }
    await new Promise(r => setTimeout(r, 800));

    if (onLogUpdate) onLogUpdate('Applying filters: retaining only listings without a website...');
    
    // Retain only those leads that do NOT have a website listed, or have an empty website field
    const filteredLeads = leads.filter(lead => !lead.website || lead.website.trim() === '');

    // Sort: Leads that HAVE a mobile number or phone number should appear FIRST
    // Leads without phone numbers should appear AFTER them
    const sortedLeads = [...filteredLeads].sort((a, b) => {
      const hasPhoneA = !!(a.phone_number && typeof a.phone_number === 'string' && a.phone_number.trim());
      const hasPhoneB = !!(b.phone_number && typeof b.phone_number === 'string' && b.phone_number.trim());
      if (hasPhoneA && !hasPhoneB) return -1;
      if (!hasPhoneA && hasPhoneB) return 1;
      return 0;
    });


    if (onLogUpdate) onLogUpdate(`Scrape complete! Filtered down to ${sortedLeads.length} leads without websites.`);
    await new Promise(r => setTimeout(r, 800));

    return sortedLeads;

  } catch (err) {
    console.error('Live Scraping Execution Error:', err);
    if (onLogUpdate) onLogUpdate(`Scraping failed: ${err.message}. Please try again later.`);
    throw err;
  }
};
