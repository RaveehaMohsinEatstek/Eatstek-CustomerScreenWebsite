import React from "react";
import { Modal } from "flowbite-react";

const MealsPopup = ({ open, onClose, items, title, getMealId }) => {
  if (!open) return null;

  return (
    <Modal
      show={open}
      position="center"
      popup
      onClose={onClose}
      size="md"
      dismissible
    >
      <Modal.Header>{title}</Modal.Header>
      <Modal.Body>
        {items.map((item, index) => (
          <div
            key={index}
            onClick={() => getMealId(item?.id)}
            className="flex g-[10px] border border-gray-200 rounded-md p-2 mb-3 me-3 hover:bg-gray-200 transition-all cursor-pointer"
          >
            <img
              src={`https://${import.meta.env.VITE_API_BASE_URL}/storage/${item.product_image}`}
              className="w-[70px] h-[70px]"
              alt={item.product_name}
            />
            <div className="ms-3">
              <h6 className="text-xl font-bold text-gray-900">
                {item.product_name}
              </h6>
              <p className="font-normal text-gray-700">{item.product_price}</p>
            </div>
          </div>
        ))}
      </Modal.Body>
    </Modal>
  );
};

export default MealsPopup;
