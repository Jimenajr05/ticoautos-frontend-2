import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

export const login = async (userData) => {
    const response = await axios.post(`${API_URL}/login`, userData); 
    return response.data;
};

export const register = async (userData) => {
    const response = await axios.post(`${API_URL}/register`, userData);  
    return response.data;
};

export const getPadronInfo = async (cedula) => {
    const response = await axios.get(`${API_URL}/padron/${cedula}`);
    return response.data;
};

export const googleAuth = async (data) => {
    const response = await axios.post(`${API_URL}/google`, data);
    return response.data;
};