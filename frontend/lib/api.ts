/**
 * API Configuration and Utility Functions
 * Centralized API client for backend communication
 */

// Use environment variable or fallback to localhost
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`,
      }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * API Client Interface
 */
export const api = {
  // Health check
  health: () => fetchAPI('/health'),

  // Flights
  flights: {
    search: (params: {
      from: string;
      to: string;
      date?: string;
    }) => {
      const queryParams = new URLSearchParams({
        from: params.from,
        to: params.to,
        ...(params.date && { date: params.date }),
      });
      return fetchAPI(`/flights/search?${queryParams}`);
    },
    
    getAll: () => fetchAPI('/flights'),
    
    getById: (id: string) => fetchAPI(`/flights/${id}`),
  },

  // Airports
  airports: {
    getAll: () => fetchAPI('/airports'),
    
    search: (query: string) => 
      fetchAPI(`/airports/search?q=${encodeURIComponent(query)}`),
  },

  // Bookings
  bookings: {
    getAll: () => fetchAPI('/bookings'),
    
    create: (data: any) =>
      fetchAPI('/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    getById: (id: string) => fetchAPI(`/bookings/${id}`),
    
    getByUserId: (userId: string) => 
      fetchAPI(`/bookings/user/${userId}`),
    
    cancel: (id: string) =>
      fetchAPI(`/bookings/${id}/cancel`, {
        method: 'PUT',
      }),
  },

  // Passengers
  passengers: {
    getAll: () => fetchAPI('/passengers'),
    
    create: (data: any) =>
      fetchAPI('/passengers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    getById: (id: string) => fetchAPI(`/passengers/${id}`),
    
    update: (id: string, data: any) =>
      fetchAPI(`/passengers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: string) =>
      fetchAPI(`/passengers/${id}`, {
        method: 'DELETE',
      }),
  },

  // Users
  users: {
    register: (data: any) =>
      fetchAPI('/users/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    login: (data: { username: string; password: string }) =>
      fetchAPI('/users/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    getProfile: (id: string) => fetchAPI(`/users/profile/${id}`),
  },

  // Payments
  payments: {
    process: (data: any) =>
      fetchAPI('/payments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    getByBookingId: (bookingId: string) =>
      fetchAPI(`/payments/booking/${bookingId}`),
    
    getAll: () => fetchAPI('/payments'),
  },
};

export default api;

