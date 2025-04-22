import axios from 'axios';
import Book from '../types/Book';

const API_URL = 'http://localhost:5137/api'; // Adjust port to match your .NET API

export const bookApi = {
  getAll: async (): Promise<Book[]> => {
    const response = await axios.get<Book[]>(`${API_URL}/books`);
    console.log(response.data);
    return response.data;
  },

  getById: async (id: number): Promise<Book> => {
    const response = await axios.get<Book>(`${API_URL}/books/${id}`);
    console.log(response.data);
    return response.data;
  },

  create: async (book: Book): Promise<Book> => {
    const response = await axios.post<Book>(`${API_URL}/books`, book);
    console.log(response.data);
    return response.data;
  },

  update: async (id: number, book: Book): Promise<void> => {
    await axios.put(`${API_URL}/books/${id}`, book);
  },

  updateAvailability: async (id: number, isAvailable: boolean): Promise<void> => {
    await axios.patch(`${API_URL}/books/${id}/availability?isAvailable=${isAvailable}`);
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/books/${id}`);
  }
};