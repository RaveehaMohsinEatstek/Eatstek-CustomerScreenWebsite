import React from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from "../../../components/common/CustomButton";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen w-full items-center justify-center bg-black">
      <div className="text-center">
        <h1 className="font-pop font-semibold text-[90px] text-gray leading-none mb-[10px]">
          404
        </h1>
        <p className="font-pop font-normal text-[16px] text-white mb-[30px]">We're sorry, the page you requested could not be found.</p>
        
      </div>
    </div>
  );
};

export default NotFoundPage;
