import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api/agents`;

export default function Sort() {
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    useEffect(() => {
        axios
            .get(API)
            .then((response) => {
                setData(response.data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }, []);

    const totalItems = data.length;
    const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const end = totalItems === 0 ? 0 : Math.min(currentPage * itemsPerPage, totalItems);


    return (
        <div className="cs_shop_filter_wrap">
            <div className="cs_number_of_product">
                {totalItems === 0
                    ? 'No agents found'
                    : `Showing ${start}–${end} of ${totalItems} results`}
            </div>
            <form action="/" className="cs_shop_filter_form">
                <select name="sort">
                    <option value="latest">Sort by latest</option>
                    <option value="low_price">Sort by low price</option>
                    <option value="high_price">Sort by high price</option>
                </select>
            </form>
        </div>
    );
}
