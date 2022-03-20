import './App.css';
import { useState, useEffect, useRef } from 'react';
import { MdDone, MdClear, MdCompareArrows } from 'react-icons/md'
import { data } from './data.js'

import randomImg from './random_color_gradient.jpg'

import Options from './components/Options';


// the api key used is from "my first project"
// const DOMAIN = "http://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&pithumbsize=100&"


function App() {
  const DOMAIN = "https://www.googleapis.com/customsearch/v1/siterestrict?"
  const DOMAIN_1 = "https://imdb-api.com/en/API/SearchMovie/" + process.env.REACT_APP_IMDB_KEY;
  const DOMAIN_2 = "https://api.unsplash.com/search/photos?"

  // Domain where we send requests to
  const [currentDomain, setCurrentDomain] = useState(0);

  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState([]);

  const [picked, setPicked] = useState([]);
  const [tempOptions, setTempOptions] = useState(null);
  const [change, setChange] = useState(false);

  // Middle Div
  const orDivRef = useRef(null);
  const [orDivValue, setOrDivValue] = useState(null);

  // Score
  const scoreRef = useRef(null);
  const highScoreRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Menu
  const [startMenuOpen, setStartMenuOpen] = useState(true);
  const [gameOverMenuOpen, setGameOverMenuOpen] = useState(false);

  const changeDomain = () => {
    setCurrentDomain(currentDomain === 0 ? 1 : 0);
  };


  const setUp = async () => {
    const _len = Object.keys(data).length;
    let _index = Math.floor(Math.random() * _len);
    let _option1 = data[_index.toString()];
    const _img1 = await search(_option1["Title"]);
    _option1 = {..._option1, src: _img1 };

    let _index2 = Math.floor(Math.random() * _len);
    while (_index === _index2) {
      _index = Math.floor(Math.random() * _len);
    }
    let _option2 = data[_index2.toString()]
    const _img2 = await search(_option2["Title"]);
    _option2 = {..._option2, src: _img2 };


    setPicked([_index, _index2]);
    setOptions([_option1, _option2]);
  }

  const getNewOptions = async () => {
    const _len = Object.keys(data).length;
    let _options = [options[1]];

    let _index = Math.floor(Math.random() * _len);
    while (_index in picked) {
      _index = Math.floor(Math.random() * _len);
    }

    setPicked([...picked, _index])

    let _newOption = data[_index.toString()];
    let _newImg = await search(_newOption.Title);
    setTempOptions([..._options, {..._newOption, src: _newImg}]);
  }

  const changeOptions = () => {
    setOptions([...tempOptions]);

    resetOrDiv();

    setTimeout(() => {
      setChange(false);
    }, 1000);

  }

  const search = async (query) => {
    let params;
    let url;
    if (currentDomain === 0) {
      params = new URLSearchParams({ q:query.slice(0, -7), key:process.env.REACT_APP_API_KEY, cx: process.env.REACT_APP_CSE_KEY, searchType: "image" });
      url = DOMAIN + params;
    } else if (currentDomain === 1) {
      params = "/" + query.slice(0, -7);
      url = DOMAIN_1 + params;
    } else if (currentDomain === 2) {
      params = new URLSearchParams({query: query.slice(0, -7), client_id: process.env.REACT_APP_UNSPLASH_KEY})
      url = DOMAIN_2 + params;
    }
    // let params = new URLSearchParams({titles: query.slice(0, -7), origin: "*"})
    let _data;
    await fetch(url).then( (res) => {
      if (res.status === 429) {
        changeDomain();
      }
      return res.json()

    } ).then( (data) => {
      try {
        if (currentDomain === 0) {
          _data = data.items[0].link;
        } else if (currentDomain === 1) {
          _data = data.results[0].image;
        } else if (currentDomain === 2) {
          _data = data.results[0].urls.regular;
        }

      } catch (error) {
        _data = randomImg;
        if (currentDomain != 0) {
          setCurrentDomain(2);
        }
      }
    }).catch( err => {
        _data = randomImg;

    })
    return _data

  }

  const incrementScore = () => {
    setScore(score + 1);
    scoreRef.current.classList.add("play");

    setTimeout(() => {
      scoreRef.current.classList.remove("play");
    }, 1000);
  }

  const changeHighScore = () => {
      setScore(0);
      if (score > highScore) {
        setHighScore(score);
        highScoreRef.current.classList.add("play");
        highScoreRef.current.value = `+${highScore - score}`

        setTimeout(() => {
          highScoreRef.current.classList.remove("play");
        }, 1000);
      }
  }

  const reset = () => {
    setScore(0);
    setUp();

    setTimeout(() => {
      resetOrDiv();
      setChange(true);
    }, 300);

    setTimeout(() => {
      setChange(false);
    }, 1500);
  }

  // Small Helper Functions
  const resetOrDiv = () => {
    orDivRef.current.classList.remove("correct");
    orDivRef.current.classList.remove("wrong");
    orDivRef.current.classList.remove("show");
    setOrDivValue(null);

  }


  useEffect(() => {
      setUp();
    }, [])

  useEffect(() => {
    if (selected.length < 1) return;

    orDivRef.current.classList.add("show");

    if (options[0]["World Sales"] > options[1]["World Sales"] && selected[0] === 1) {
      orDivRef.current.classList.add("correct");
      setOrDivValue("correct");
      incrementScore();
      getNewOptions();
    }
    else if (options[0]["World Sales"] < options[1]["World Sales"] && selected[0] === 2) {
      console.log("Correct")
      orDivRef.current.classList.add("correct");
      setOrDivValue("correct");
      incrementScore();
      getNewOptions();
    }
    else {
      console.log("Wrong");
      orDivRef.current.classList.add("wrong");
      setOrDivValue("wrong");
      changeHighScore();
      setTimeout(() => {
        setGameOverMenuOpen(true);
      }, 1000);
    }


  }, [selected])

  useEffect(() => {
    if (!tempOptions) return;
    setTimeout(() => {
      setChange(true);
      setSelected([]);
      setTimeout(() => {
        changeOptions();
      }, 300);
    }, 2000);
  }, [tempOptions])





  return (
    <div className="App">
      <div className='scoreContainer'>
        <div>
          <p>Score: {score} </p>
          <div className='scoreIncrement' ref={scoreRef} >+1</div>
        </div>
        <div>
          <p>High Score: {highScore} </p>
          <div className='scoreIncrement' ref={highScoreRef} >+1</div>
        </div>
      </div>
      <div className='optionsContainer'>
        <Options i={1} data={options[0]} setSelected={setSelected} selected={selected} change={change} />
        <div className='orDiv' ref={orDivRef}>
          <p>{ orDivValue ? orDivValue === "correct" ? <MdDone /> : <MdClear /> : <MdCompareArrows /> }</p>
        </div>
        <Options i={2} data={options[1]} setSelected={setSelected} selected={selected} change={change} />
      </div>
      { startMenuOpen && <StartMenu setStartMenuOpen={setStartMenuOpen} />}
      { gameOverMenuOpen && <GameOverMenu setGameOverMenuOpen={setGameOverMenuOpen} reset={reset} score={score} highScore={highScore} />}
    </div>
  );
}

export default App;


const StartMenu = ({ setStartMenuOpen }) => {
  const menuRef = useRef(null);

  const close = () => {
    setStartMenuOpen(false);
    menuRef.current.classList.add("close");
  }

  return (
    <div className='menuContainer' ref={menuRef} >
      <div className='startMenu'>
        <h1>Higher or Lower: Movie Edition</h1>
        <p>Guess which movie generated more total sales (domestic and international)</p>
        <button onClick={close} >Start</button>
      </div>
    </div>
  )
}



const GameOverMenu = ({ setGameOverMenuOpen, reset, score, highScore }) => {
  const menuRef = useRef(null);

  const close = () => {
    reset();
    setGameOverMenuOpen(false);
    menuRef.current.classList.add("close");
  }

  return (
    <div className='menuContainer' ref={menuRef} >
      <div className='gameOverMenu'>
        <h1>Game Over</h1>
        <div>
          <p>Score: {score}</p>
          <p>High Score: {highScore}</p>
        </div>
        { highScore - score < 3 && "Close One!"}
        <button onClick={close} >Play Again</button>
      </div>
    </div>
  )
}