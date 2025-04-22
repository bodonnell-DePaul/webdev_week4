import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import  Book  from '../types/Book';
import { bookApi } from '../services/bookApi';

const BookList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await bookApi.getAll();
        setBooks(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch books');
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await bookApi.delete(id);
        setBooks(books.filter(book => book.id !== id));
      } catch (err) {
        setError('Failed to delete book');
      }
    }
  };

  const toggleAvailability = async (id: number, isAvailable: boolean) => {
    try {
      await bookApi.updateAvailability(id, !isAvailable);
      setBooks(books.map(book => 
        book.id === id ? { ...book, isAvailable: !isAvailable } : book
      ));
    } catch (err) {
      setError('Failed to update book availability');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="book-list">
      <h2>Books Collection</h2>
      <Link to="/add" className="btn-add">Add New Book</Link>
      
      {books.length === 0 ? (
        <p>No books available</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Year</th>
              <th>Genre</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.year}</td>
                <td>{book.genre}</td>
                <td>
                  <button 
                    className={book.isAvailable ? 'status-available' : 'status-unavailable'}
                    onClick={() => book.id && toggleAvailability(book.id, book.isAvailable)}
                  >
                    {book.isAvailable ? 'Available' : 'Unavailable'}
                  </button>
                </td>
                <td>
                  <Link to={`/edit/${book.id}`} className="btn-edit">Edit</Link>
                  <button 
                    className="btn-delete" 
                    onClick={() => book.id && handleDelete(book.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BookList;