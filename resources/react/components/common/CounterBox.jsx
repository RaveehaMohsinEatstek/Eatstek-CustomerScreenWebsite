import React from "react";

const CounterBox = (props) => {

  const handleIncrement = () => {
    props.setQuantity(props?.quantity + 1);
  };

  const handleDecrement = () => {
    if (props?.quantity > 1) {
        props.setQuantity(props?.quantity - 1);
    }
  };

  return (

      <div className="flex items-center">
        <button
          onClick={handleDecrement}
          className="px-4 py-2 bg-white text-black rounded-md shadow-md hover:bg-[#d97706] border border-[#d97706] hover:text-white"
        >
          -
        </button>
        <div className="text-xl font-bold w-[50px] h-[42px] text-center flex items-center justify-center">{props?.quantity}</div>
        <button
          onClick={handleIncrement}
          className="px-4 py-2 bg-white text-black rounded-md shadow-md hover:bg-[#d97706] border border-[#d97706] hover:text-white"
        >
          +
        </button>
      </div>

  );
};

export default CounterBox;
