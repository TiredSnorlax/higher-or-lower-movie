import { useEffect, useRef, useState } from 'react'
import "../styles/options.css"

const Options = ({ i, data, setSelected, selected, change }) => {
  const cardRef = useRef(null);
  const [showing, setShowing] = useState(false);

  const processNumber = (num) => {
      return "$" + (num / 1000000).toFixed(1) + " million"
  }

  const showAns = () => {
    cardRef.current.classList.remove("show");
    cardRef.current.classList.add("show");
    setTimeout(() => {
      setShowing(true);
    }, 300);
    setTimeout(() => {
      cardRef.current.classList.remove("show");
    }, 1000);
  };


  useEffect(() => {
    if (selected.length < 0) return;
    showAns();
  }, [selected])

  useEffect(() => {
    if (change) {
      cardRef.current.classList.add("change");
      setTimeout(() => {
        setShowing(false);
      }, 400);
    } else {
      cardRef.current.classList.remove("change");
    }
  }, [change])



  return (
      <div className="optionCard" onClick={() => setSelected([i])} ref={cardRef}>
          { data &&
            <>
              <p>{ showing ? processNumber(data["World Sales"]) : data.Title}</p>
              <img src={data.src}  />
            </>
          }
      </div>
  )
}

export default Options