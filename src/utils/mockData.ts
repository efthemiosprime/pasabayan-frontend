/**
 * Mock data utilities for Pasabay application
 * Use these for development, testing, or as fallbacks when API calls fail
 */

// Sample travelers for the mock data
const sampleTravelers = [
  {
    id: 1,
    name: 'Juan Dela Cruz',
    rating: 4.8,
    profile_photo: undefined,
    email: 'juan@example.com',
    phone: '+639171234567',
    is_verified: true
  },
  {
    id: 2,
    name: 'Maria Santos',
    rating: 4.5,
    profile_photo: undefined,
    email: 'maria@example.com',
    phone: '+639189876543',
    is_verified: true
  },
  {
    id: 3,
    name: 'Pedro Reyes',
    rating: 4.2,
    profile_photo: undefined,
    email: 'pedro@example.com',
    phone: '+639157654321',
    is_verified: false
  }
];

// Generate the current date and dates for the next 30 days
const today = new Date();
const getDayFromNow = (days: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

// Sample origins and destinations
const locations = [
  'Manila', 'Cebu', 'Davao', 'Baguio', 'Iloilo', 
  'Zamboanga', 'Tacloban', 'Cagayan de Oro', 'General Santos',
  'Bacolod', 'Naga', 'Butuan', 'Tagaytay', 'Laoag', 'Legazpi'
];

// Sample trip statuses
const statuses = ['upcoming', 'in_progress', 'completed', 'cancelled'] as const;

/**
 * Generate a mock trip
 */
const generateMockTrip = (id: number) => {
  const travelerId = Math.floor(Math.random() * 3) + 1;
  const traveler = sampleTravelers.find(t => t.id === travelerId) || sampleTravelers[0];
  
  const departDays = Math.floor(Math.random() * 10) + 1; // 1-10 days from now
  const arrivalDays = departDays + Math.floor(Math.random() * 5) + 1; // 1-5 days after departure
  
  const originIndex = Math.floor(Math.random() * locations.length);
  let destinationIndex = Math.floor(Math.random() * locations.length);
  // Ensure destination is different from origin
  while (destinationIndex === originIndex) {
    destinationIndex = Math.floor(Math.random() * locations.length);
  }
  
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  return {
    id,
    traveler_id: traveler.id,
    traveler: {
      id: traveler.id,
      name: traveler.name,
      rating: traveler.rating,
      profile_photo: traveler.profile_photo,
      email: traveler.email,
      phone: traveler.phone,
      is_verified: traveler.is_verified
    },
    origin: locations[originIndex],
    destination: locations[destinationIndex],
    departure_date: getDayFromNow(departDays),
    arrival_date: getDayFromNow(arrivalDays),
    available_space: Math.floor(Math.random() * 20) + 1, // 1-20 kg
    notes: `Sample trip from ${locations[originIndex]} to ${locations[destinationIndex]}. Contact me for more details.`,
    status,
    created_at: getDayFromNow(-Math.floor(Math.random() * 10)), // 0-10 days ago
    requests_count: Math.floor(Math.random() * 5) // 0-4 requests
  };
};

/**
 * Get a list of mock trips
 */
export const getMockTrips = (count = 10) => {
  return Array(count).fill(null).map((_, index) => generateMockTrip(index + 1));
};

/**
 * Get a single mock trip by ID
 */
export const getMockTripById = (id: number) => {
  return generateMockTrip(id);
};

export default {
  getMockTrips,
  getMockTripById
}; 