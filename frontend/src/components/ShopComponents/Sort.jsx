import React from 'react';

export default function Sort() {
  return (
    <div className="cs_shop_filter_wrap">
      <div className="cs_number_of_product">Showing 1–9 of 12 results</div>
      <form action="/" className="cs_shop_filter_form">
        <select name="akhfk">
          <option value="asdf">Sort by latest</option>
          <option value="hiqwergh">Sort by low price</option>
          <option value="adf">Sort by high price</option>
        </select>
      </form>
    </div>
  );
}
