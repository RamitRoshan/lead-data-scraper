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

  return `leads_${cleanIndustry}_${cleanLocation}`;
};

/**
 * Re-formats sanitized table names into human-readable titles.
 * E.g., 'leads_coaching_centre_bangalore' -> 'Coaching Centre in Bangalore'
 */
export const formatTableName = (tableName) => {
  if (!tableName || !tableName.startsWith('leads_')) return tableName;
  
  const parts = tableName.replace(/^leads_/, '').split('_');
  if (parts.length < 2) return tableName;
  
  // Try to separate industry and location.
  // By convention, the last element is the location (or we can reconstruct it)
  const location = parts[parts.length - 1];
  const industryParts = parts.slice(0, parts.length - 1);
  
  const formatWord = (word) => word.charAt(0).toUpperCase() + word.slice(1);
  
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

export const simulateScraping = async (industry, location, onLogUpdate) => {
  const steps = [
    { log: 'Initializing B2B scraping session...', delay: 500 },
    { log: 'Rotating residential proxy IPs...', delay: 600 },
    { log: `Searching business directory for "${industry} in ${location}"...`, delay: 800 },
    { log: 'Extracting page 1 results (entries 1-20)...', delay: 700 },
    { log: 'Scrolling search view to load more results (infinite scroll)...', delay: 800 },
    { log: 'Extracting page 2 results (entries 21-40)...', delay: 700 },
    { log: 'Scrolling search view to load more results (infinite scroll)...', delay: 800 },
    { log: 'Extracting page 3 results (entries 41-60)...', delay: 700 },
    { log: 'Scrolling search view to load more results (infinite scroll)...', delay: 800 },
    { log: 'Extracting page 4 results (entries 61-80)...', delay: 700 },
    { log: 'Crawling contact details and check website availability...', delay: 900 },
    { log: 'Applying filters: selecting leads without websites...', delay: 600 }
  ];

  // Run through simulation logs
  for (const step of steps) {
    if (onLogUpdate) {
      onLogUpdate(step.log);
    }
    await new Promise((resolve) => setTimeout(resolve, step.delay));
  }

  // Generate mock leads
  const indKey = getIndustryKey(industry);
  const temp = INDUSTRY_TEMPLATES[indKey];
  const locKey = (location || '').toLowerCase();
  const areas = AREA_MAPPING[locKey] || AREA_MAPPING.default;
  const phoneCode = PHONE_PREFIX_MAPPING[locKey] || PHONE_PREFIX_MAPPING.default;

  // Generate a larger number of raw leads (60 to 80 listings)
  const count = Math.floor(Math.random() * 21) + 60;
  const leads = [];

  for (let i = 0; i < count; i++) {
    // Generate unique name combinations
    const prefix = temp.prefixes[Math.floor(Math.random() * temp.prefixes.length)];
    const suffix = temp.suffixes[Math.floor(Math.random() * temp.suffixes.length)];
    const area = areas[Math.floor(Math.random() * areas.length)];
    
    // Add local area suffix to business names for variety and uniqueness
    const name = i % 2 === 0 ? `${prefix} ${suffix} ${area}` : `${prefix} ${suffix}`;
    
    // Check for duplicate name
    if (leads.some(l => l.business_name === name)) {
      continue;
    }

    const domain = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const webExt = temp.websites[Math.floor(Math.random() * temp.websites.length)];
    
    // Mix of website availability: only 1 in 3 listings (33%) has a website
    const hasWebsite = i % 3 === 0;
    const website = hasWebsite ? `https://www.${domain}.${webExt === 'edu' ? 'edu.in' : webExt === 'salon' || webExt === 'spa' || webExt === 'gym' ? 'in' : 'com'}` : '';

    // Create random Indian phone number (either landline or mobile)
    let phoneNumber;
    if (Math.random() > 0.4) {
      const mobPart1 = ['98', '99', '88', '77', '91', '80'][Math.floor(Math.random() * 6)];
      const mobPart2 = Math.floor(Math.random() * 90000000 + 10000000);
      phoneNumber = `+91 ${mobPart1}${mobPart2.toString().substring(0, 8)}`;
    } else {
      const number = Math.floor(Math.random() * 9000000 + 1000000);
      phoneNumber = `${phoneCode}-${number}`;
    }

    const formattedCity = location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();
    const address = `${Math.floor(Math.random() * 150) + 1}, Main Road, ${area}, ${formattedCity}, India`;

    const ratingRange = temp.ratings;
    const rating = (Math.random() * (ratingRange[1] - ratingRange[0]) + ratingRange[0]).toFixed(1);

    leads.push({
      business_name: name,
      phone_number: phoneNumber,
      address,
      website: website || null,
      rating: parseFloat(rating),
      category: industry.charAt(0).toUpperCase() + industry.slice(1).toLowerCase(),
      city: formattedCity
    });
  }

  // Filter to return only leads that do not have a website
  const filteredLeads = leads.filter(lead => !lead.website || lead.website.trim() === '');

  if (onLogUpdate) {
    onLogUpdate('Successfully scraped B2B leads. Synchronizing database...');
  }
  await new Promise((resolve) => setTimeout(resolve, 800));

  return filteredLeads;
};
