import React, { useState } from 'react';
import MultiRangeSlider from 'multi-range-slider-react';
const tagList = ['Brand', 'Digital', 'Marketing', 'Creative', 'Graphics'];
const categoryList = ['Design', 'Creative', 'Illustration', 'Nature'];
const brandList = ['Apple', 'Samsung', 'Walton', 'Oneplus'];

export default function Filter() {
  const [activeTag, setActiveTag] = useState(null);
  const [minValue, setMinValue] = useState(10);
  const [maxValue, setMaxValue] = useState(400);
  const handleInput = e => {
    setMinValue(e.minValue);
    setMaxValue(e.maxValue);
  };
  return (
    <div className="cs_shop_sidebar">
      <div className="cs_shop_sidebar_widget">
        <form action="#" className="cs_shop_search">
          <input
            className="cs_shop_search_input"
            type="text"
            placeholder="Search Products..."
          />
          <button className="cs_shop_search_btn">
            <svg
              width={16}
              height={16}
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.6939 10.3222C11.5282 10.1562 11.3033 10.0629 11.0688 10.0629H10.8189C10.7506 10.0629 10.6849 10.0364 10.6357 9.98894C10.535 9.89181 10.5281 9.73333 10.6148 9.62352C11.416 8.60899 11.8925 7.33012 11.8925 5.94625C11.8925 2.66209 9.23042 0 5.94625 0C2.66209 0 0 2.66209 0 5.94625C0 9.23042 2.66209 11.8925 5.94625 11.8925C7.33012 11.8925 8.60899 11.416 9.62352 10.6148C9.73333 10.5281 9.89181 10.535 9.98894 10.6357C10.0364 10.6849 10.0629 10.7506 10.0629 10.8189V11.0688C10.0629 11.3033 10.1562 11.5282 10.3222 11.6939L13.9547 15.3191C14.3316 15.6953 14.942 15.695 15.3185 15.3185C15.695 14.942 15.6953 14.3316 15.3191 13.9547L11.6939 10.3222ZM5.94625 10.0629C3.66838 10.0629 1.82962 8.22413 1.82962 5.94625C1.82962 3.66838 3.66838 1.82962 5.94625 1.82962C8.22413 1.82962 10.0629 3.66838 10.0629 5.94625C10.0629 8.22413 8.22413 10.0629 5.94625 10.0629Z"
                fill="#4F4747"
              />
            </svg>
          </button>
        </form>
      </div>
      <div className="cs_shop_sidebar_widget">
        <h3 className="cs_shop_sidebar_widget_title">Categories</h3>
        <ul className="cs_shop_sidebar_category_list">
          {categoryList.map((item, index) => (
            <li key={index}>
              <div className="cs_checkbox_group" key={index}>
                <input type="checkbox" id={item} />
                <label htmlFor={item}>{item}</label>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="cs_shop_sidebar_widget">
        <h3 className="cs_shop_sidebar_widget_title">Price Filter</h3>
        <MultiRangeSlider
          min={0}
          max={500}
          step={5}
          minValue={minValue}
          maxValue={maxValue}
          ruler={false}
          label={false}
          onInput={e => {
            handleInput(e);
          }}
        />
        <div className="cs_multirange_price">
          Price: ${minValue} - ${maxValue}
        </div>
      </div>
      <div className="cs_shop_sidebar_widget">
        <h3 className="cs_shop_sidebar_widget_title">Brands</h3>
        <ul className="cs_shop_sidebar_category_list">
          {brandList.map((item, index) => (
            <li key={index}>
              <div className="cs_checkbox_group" key={index}>
                <input type="checkbox" id={item} />
                <label htmlFor={item}>{item}</label>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="cs_shop_sidebar_widget">
        <h3 className="cs_shop_sidebar_widget_title">Tags</h3>
        <ul className="cs_shop_sidebar_tag_list">
          {tagList?.map((item, index) => (
            <li key={index}>
              <button
                onClick={() => setActiveTag(item)}
                className={activeTag === item ? 'active' : ''}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
