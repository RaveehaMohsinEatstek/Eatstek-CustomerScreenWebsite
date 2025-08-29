import React from "react";
import { Spinner } from "flowbite-react";
const OrderCard = (props) => {

    const { order_no, order_id, orderStatus, printStatus, created_at, ordered_products, meal, deal, startOrder = false, changeOrderStatus, buttonLoading, buttonLoadingStatus, handleSilentPrint, printContainerRef } = props;

    return (
        <>
            <div className={`rounded-md border  ${orderStatus ? "border-green-600" : "border-gray-600"} overflow-hidden mx-1 masonry-item pb-[80px] relative`}>
                <div className={`flex flex-col p-4 ${orderStatus ? "bg-green-800" : "bg-slate-800"}  text-white`}>
                    <div className="flex w-full">
                        <div className="w-3/4 text-xl font-semibold">
                            Order No
                        </div>
                        <div className={`w-1/4 text-end text-xl font-semibold ${orderStatus ? "text-white" : "text-[#d97766]"} `}>
                            {order_no}
                        </div>
                    </div>
                    <div>
                        {created_at}
                    </div>
                </div>
                <div className="flex flex-col px-3 py-4">
                    {
                        ordered_products?.map((item, index) => (
                            <div key={index} className="flex flex-col my-1">
                                <div className="flex justify-between px-2 font-semibold text-base">
                                    <div className="flex gap-1">
                                        {item?.product_name}
                                        <span className="!font-normal"> ({item?.size})</span>
                                    </div>
                                    <div>
                                        {item?.quantity}x
                                    </div>
                                </div>
                                {item?.choices?.length > 0 &&
                                    <div className="flex flex-col px-2 text-sm">
                                        <div>
                                            ● {item?.choice} - {item?.choiceOption}
                                        </div>
                                    </div>}
                            </div>
                        ))
                    }

                    {meal?.length > 0 &&
                        <>
                            <div className="px-2">
                                <div className="font-semibold bg-amber-300 text-zinc-700 rounded-sm text-center py-1 mb-1 mt-3">
                                    MEALS
                                </div>
                            </div>
                            {
                                meal?.map((item, index) => (
                                    <div key={index}>
                                        {
                                            item?.meal_products?.map((itm, i) => (
                                                <div className="flex flex-col my-1" key={i}>
                                                    <div className="flex justify-between px-2 font-semibold text-base items-center">
                                                        <div className="flex gap-1">
                                                            {itm?.product?.product_name}
                                                            ( {itm?.selected_size?.size_name})
                                                        </div>
                                                        <div className="flex-1 border-b border-dotted border-zinc-600 h-fit mx-2">
                                                        </div>
                                                        <div>
                                                            {item?.quantity}x
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col px-2">
                                                        {itm?.selected_choice?.length > 0 &&
                                                            <div className="grid grid-cols-2 gap-1 text-sm">
                                                                <div>
                                                                    ● {itm?.selected_choice[0]?.option_for_choice?.option_name}
                                                                </div>
                                                            </div>

                                                        }
                                                    </div>
                                                </div>
                                            ))
                                        }

                                    </div>
                                ))
                            }
                        </>
                    }

                    {deal?.length > 0 && <>
                        <div className="px-2">
                            <div className="font-semibold bg-sky-800 text-zinc-200 rounded-sm text-center py-1 mb-1 mt-3">
                                DEALS
                            </div>
                        </div>
                        {
                            deal?.map((item, index) => (
                                <div key={index} className="flex flex-col my-1">
                                    <div className="flex justify-between px-2 font-semibold text-base">
                                        <div className="flex gap-1">
                                            {item?.name}
                                        </div>
                                        <div>
                                            {item?.quantity}x
                                        </div>
                                    </div>
                                    <div className="flex flex-col px-2">
                                        {
                                            item?.selectedProducts?.map((itm, i) => (
                                                <div className="grid grid-cols-2 gap-1 text-sm" key={i}>
                                                    <div>
                                                        ● {itm?.selected_products[0]?.product_name} -
                                                        <span className="text-sm">
                                                            {" "}({itm?.sku_size})
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            ))
                        }
                    </>
                    }
                </div>
                <div className="flex justify-end absolute left-0 right-0 bottom-0 p-4 gap-3">
                    {!buttonLoadingStatus && startOrder && (
                        <button
                            onClick={() => changeOrderStatus(order_id)}
                            className={`px-4 py-2 ${orderStatus ? "bg-green-800" : "bg-slate-800"
                                }  text-white rounded text-sm w-full transition-all`}
                            disabled={buttonLoadingStatus}
                        >
                            {orderStatus ? "FINISH ORDER" : "START ORDER"}
                        </button>
                    )}

                    {buttonLoadingStatus && (
                        <button
                            className="px-4 py-2 text-white bg-slate-600 rounded w-full  opacity-50 cursor-not-allowed"
                            disabled
                        >
                            <Spinner aria-label="Spinner button example" size="sm" />
                            <span className="pl-3">Loading...</span>
                        </button>
                    )}

                    {/* Print Button */}
                    {/* {printStatus && ( */}
                    <button
                        className="px-4 py-2 text-white bg-[#D97706] rounded w-full"
                        onClick={handleSilentPrint}
                    >
                        Print
                    </button>

                    {/* )} */}
                </div>

            </div>
        </>
    )
}

export default OrderCard;
