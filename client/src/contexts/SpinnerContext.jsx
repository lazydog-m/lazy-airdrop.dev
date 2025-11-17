import PropTypes from 'prop-types';
import { createContext, useState } from 'react';
import logo from '../assets/img/playwright.png'

const initialState = {
  onOpen: () => { },
  onClose: () => { },
  isLoading: false,
}

const SpinnerContext = createContext(initialState);

SpinnerProvider.propTypes = {
  children: PropTypes.node,
}

const rootStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  // backgroundColor: "rgba(0, 0, 0, 0.7)",
  zIndex: 99999,
  pointerEvents: 'none'
}

function SpinnerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isInitial, setIsInitial] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  }

  const handleClose = () => {
    setIsOpen(false);
  }

  return (
    <SpinnerContext.Provider
      value={{
        onOpen: handleOpen,
        onClose: handleClose,
        isLoading: isOpen,
      }}
    >
      {/* {isOpen && */}
      {/*   <div style={rootStyle} className='select-none'> */}
      {/*     <div className="loader-wrapper"> */}
      {/*       <div className="spinner"> */}
      {/*         <div className="spinner-inner"></div> */}
      {/*       </div> */}
      {/*       <div className="logo"> */}
      {/*         <img src={logo} style={{ width: '47px' }} /> */}
      {/*       </div> */}
      {/*     </div> */}
      {/*   </div> */}
      {/* } */}
      {isOpen &&
        <div style={rootStyle} className='select-none'>
          <div className="boxes">
            <div className="box">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <div className="box">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <div className="box">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <div className="box">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
          {/* <div className={`loader-container`}> */}
          {/*   <div className="loader"> */}
          {/*     <div className="cube"></div> */}
          {/*     <div className="cube"></div> */}
          {/*     <div className="cube"></div> */}
          {/*     <div className="cube"></div> */}
          {/*   </div> */}
          {/* </div> */}
        </div>
      }
      {children}
    </SpinnerContext.Provider>
  )
}

export { SpinnerProvider, SpinnerContext }
