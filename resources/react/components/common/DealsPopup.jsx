import React from 'react';
import { Modal } from "flowbite-react";

const DealsPopup = ({ open, onClose, items, title, getDealData }) => {
  if (!open) return null;

  return (
    <Modal
      show={open}
      onClose={onClose}
      position="center"   // ✅ Vertically + horizontally center
      size="md"
      dismissible
      className="rounded-2xl"  // ✅ Rounded corners for modal container
    >
      <Modal.Header 
        className="[&>h3]:!text-black [&>h3]:!font-semibold !bg-white !flex !items-center rounded-t-2xl"
      >
        {title}
      </Modal.Header>

      <Modal.Body className="bg-white p-4 rounded-b-2xl">
        <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
          {items.map((item, index) => (
            <div 
              key={index} 
              onClick={() => getDealData({
                product_name: item?.sku_product_name,
                pid: item?.id,
                category_id: item?.deal_line_id,
                sku_id: item.sku_id,
                sku_options: item?.sku_options
              })} 
              className="flex items-center border border-gray-200 rounded-md p-3 hover:bg-gray-100 transition-all cursor-pointer bg-white text-black"
            >
              <div className="ms-2">
                <h6 className="text-base font-normal text-gray-900">{item.sku_product_name}</h6>
              </div>
            </div>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DealsPopup;
