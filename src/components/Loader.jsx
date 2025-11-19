import React from "react";
import styled from "styled-components";

const Loader = () => {
  return (
    <StyledWrapper>
      <div id="box">
        <div className="text-indigo-900">T</div>
        <div className="text-indigo-900">O</div>
        <div className="text-indigo-900">D</div>
        <div className="text-indigo-900">O</div>
        <div className="text-indigo-900">C</div>
        <div className="text-indigo-900">H</div>
        <div className="text-indigo-900">I</div>
        <div className="text-indigo-900">M</div>
        <div className="text-indigo-900">P</div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  #box div {
    display: inline-block;
    margin: 5px;
    font-size: 35px;
    font-weight: 600;
    animation: 1.5s obrot linear infinite;
  }

  #box {
    width: 500px;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  @keyframes obrot {
    0% {
      transform: rotateX(0);
    }
    12.5% {
      transform: rotateX(90deg);
    }
    25% {
      transform: rotateX(180deg);
    }
    37.5% {
      transform: rotateX(270deg);
    }
    50% {
      transform: rotateX(360deg);
    }
    100% {
      transform: rotateX(360deg);
    }
  }

  #box div:nth-child(1) {
    animation-delay: 0s;
  }
  #box div:nth-child(2) {
    animation-delay: 0.1s;
  }
  #box div:nth-child(3) {
    animation-delay: 0.2s;
  }
  #box div:nth-child(4) {
    animation-delay: 0.3s;
  }
  #box div:nth-child(5) {
    animation-delay: 0.4s;
  }
  #box div:nth-child(6) {
    animation-delay: 0.5s;
  }
  #box div:nth-child(7) {
    animation-delay: 0.6s;
  }
  #box div:nth-child(8) {
    animation-delay: 0.7s;
  }
  #box div:nth-child(9) {
    animation-delay: 0.8s;
  }
`;

export default Loader;
