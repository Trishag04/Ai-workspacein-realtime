import api from '../utils/api.js'; 
// Endpoint: POST /employees (requires ADMIN/MANAGER token)
export const createUser = async (userData) => {
    try {
        // Sends { name, email, password, role } to the protected backend route
        const response = await api.post('/employees', userData);
        return response.data;
    } catch (error) {
        // Throw the backend error message for the UI to display
        throw error.response?.data || new Error("Failed to create user due to network error.");
    }
};

// Endpoint: GET /employees (for displaying the user list)
// The existing table uses MOCK_USERS, we need to fetch real data now.
export const fetchAllUsers = async () => {
    try {
        const response = await api.get('/employees');
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error("Failed to fetch user list.");
    }
};