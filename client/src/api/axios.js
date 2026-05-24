import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://personalfinance-tracker.onrender.com'
});

export default instance;