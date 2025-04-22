import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Book from '../types/Book';
import { bookApi } from '../services/bookApi';

const BookForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [book, setBook] = useState<Book>({
    title: '',
    author: '',
    year: new Date().getFullYear(),
    genre: '',
    isAvailable: true
  });

  useEffect(() => {
    if (id) {
      const fetchBook = async () => {
        setLoading(true);
        try {
          const data = await bookApi.getById(Number(id));
          setBook(data);
        } catch (err) {
          setError('Failed to fetch book details');
        }
        setLoading(false);
      };

      fetchBook();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setBook({
      ...book,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : name === 'year' ? Number(value) : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (id) {
        await bookApi.update(Number(id), book);
      } else {
        await bookApi.create(book);
      }
      navigate('/');
    } catch (err) {
      setError(`Failed to ${id ? 'update' : 'create'} book`);
      setLoading(false);
    }
  };

  if (loading && id) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="book-form">
      <h2>{id ? 'Edit Book' : 'Add New Book'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={book.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="author">Author</label>
          <input
            type="text"
            id="author"
            name="author"
            value={book.author}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="year">Year</label>
          <input
            type="number"
            id="year"
            name="year"
            value={book.year}
            onChange={handleChange}
            min="1000"
            max={new Date().getFullYear()}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="genre">Genre</label>
          <input
            type="text"
            id="genre"
            name="genre"
            value={book.genre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group checkbox">
          <input
            type="checkbox"
            id="isAvailable"
            name="isAvailable"
            checked={book.isAvailable}
            onChange={handleChange}
          />
          <label htmlFor="isAvailable">Available</label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : id ? 'Update Book' : 'Add Book'}
          </button>
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={() => navigate('/')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookForm;