import React, { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import axios from 'axios';

const PAGE_COUNT = 10;

interface Planet {
  name: string;
  population: string;
}

interface PlanetsHash {
  [x: string]: Planet;
}
interface Person {
  name: string;
  birth_year: string;
  homeworld: string;
  planet?: Planet;
}

function App() {
  const [planets, setPlanets] = useState<PlanetsHash>({});
  const [initialized, setInitialized] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [nextPeople, setNextPeople] = useState('');
  const [prevPeople, setPrevPeople] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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

  const planetsRef = useRef<PlanetsHash>({});
  const restCallMadeForPlanet = useRef<{ [x: string]: boolean }>({});
  useEffect(() => {
    people.forEach(async (person: Person) => {
      if (planetsRef.current[person.homeworld] || restCallMadeForPlanet.current[person.homeworld]) {
        return;
      }
      restCallMadeForPlanet.current[person.homeworld] = true;
      const { data: planet } = await axios.get(person.homeworld);
      setPlanets({
        ...planetsRef.current,
        [person.homeworld]: planet
      });
      planetsRef.current[person.homeworld] = planet;
    });
  }, [people]);

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

  const handleInitialize = useCallback(
    (person) => {
      setInitialized(true);
      handleLoadPeople('/api/people');
    },
    [handleLoadPeople]
  );

  return (
    <div className='app'>
      <h3 className='title'>Homeworld people</h3>
      {!initialized && <button onClick={handleInitialize}>Initialize Homeworld</button>}
      {initialized && (
        <>
          <h3>{count} People</h3>
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
          <ul className='people'>
            {loading && <div className='spinner'></div>}
            {!loading && (
              <li className='people_heading'>
                <span>Name</span>
                <span>Birth Year</span>
                <span>Homeworld name</span>
                <span>Homeworld population</span>
              </li>
            )}
            {!loading &&
              people.map((person, index) => (
                <li className='person' key={index}>
                  <span className='person-name'>
                    {getPersonIndex(index)}.&nbsp;{person.name}
                  </span>
                  <span>{person.birth_year}</span>
                  {planets[person.homeworld] ? (
                    <>
                      <span>{planets[person.homeworld].name ?? '...'}</span>
                      <span>{planets[person.homeworld].population ?? '...'}</span>
                    </>
                  ) : (
                    <>
                      <div className='small-spinner'></div>
                      <div className='small-spinner'></div>
                    </>
                  )}
                </li>
              ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
