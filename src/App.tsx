import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';

const PAGE_COUNT = 10;
interface Person {
  name: string;
}

function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [nextPeople, setNextPeople] = useState('');
  const [prevPeople, setPrevPeople] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const handlePersonClick = useCallback((person) => {
    console.log({ person });
  }, []);

  const handleLoadPeople = useCallback(async (url) => {
    setLoading(true);
    const {
      data: { count, next, previous, results }
    } = await axios.get(url);
    console.log({ count, next, previous, results });
    setNextPeople(next);
    setPrevPeople(previous);
    setCount(count);
    setPeople(results);
    setLoading(false);
  }, []);

  const handleOnNextClick = useCallback(() => {
    handleLoadPeople(nextPeople);
    setCurrentPage(currentPage + 1);
  }, [currentPage, handleLoadPeople, nextPeople]);

  const handleOnPrevClick = useCallback(async () => {
    if (currentPage > 1) {
      handleLoadPeople(prevPeople);
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage, handleLoadPeople, prevPeople]);

  const getPersonIndex = useCallback(
    (index) => {
      let pageBuffer = PAGE_COUNT * (currentPage - 1);
      if (currentPage > 1) {
        pageBuffer = PAGE_COUNT * (currentPage - 1);
      }
      console.log({ pageBuffer, currentPage });
      return pageBuffer + index + 1;
    },
    [currentPage]
  );

  useEffect(() => {
    setTotalPages(Math.ceil(count / PAGE_COUNT));
  }, [count]);

  useEffect(() => {
    handleLoadPeople('/api/people');
  }, [handleLoadPeople]);

  return (
    <div className='app'>
      <h3>{count} People</h3>
      <ul className='people'>
        {!loading &&
          people.map((person, index) => (
            <li className='person' key={index}>
              <button onClick={() => handlePersonClick(person)}>
                {getPersonIndex(index)}&nbsp;{person.name}
              </button>
            </li>
          ))}
      </ul>
      <div className='paging'>
        <p>
          Page {currentPage} of {totalPages}
        </p>
        <button disabled={loading || !prevPeople} onClick={handleOnPrevClick}>
          Prev
        </button>
        <button disabled={loading || !nextPeople} className='next' onClick={handleOnNextClick}>
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
