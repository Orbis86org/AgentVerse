import React, {useState, useEffect, useCallback} from 'react';
import MultiRangeSlider from 'multi-range-slider-react';
import axios from 'axios';
import debounce from 'lodash.debounce';

export default function Filter({ onFilterChange }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedModels, setSelectedModels] = useState([]);
    const [selectedPurposes, setSelectedPurposes] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const [minCredits, setMinCredits] = useState(0);
    const [maxCredits, setMaxCredits] = useState(500);

    const [modelList, setModelList] = useState(['gpt-4', 'gpt-4o']);
    const [purposeList, setPurposeList] = useState(['Web 3', 'Education']);
    const [tagList, setTagList] = useState(['Gaming', 'Research', 'Blockchain']);

    const debouncedHandleSliderChange = useCallback(
        debounce((e) => {
            if( e ){
                setMinCredits(e.minValue);
                setMaxCredits(e.maxValue);
            }
        }, 300), // 300ms delay
        []
    );

    useEffect(() => {
        async function fetchFilterOptions() {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/agents/filter-options`);
                setModelList(res.data.models || []);
                setPurposeList(res.data.purposes || []);
                setTagList(res.data.tags || []);
            } catch (err) {
                console.error('Failed to fetch filter options', err);
            }
        }

        fetchFilterOptions();
    }, []);

    useEffect(() => {
        onFilterChange({
            searchTerm,
            selectedModels,
            selectedPurposes,
            selectedTag,
            minCredits,
            maxCredits,
        });
    }, [searchTerm, selectedModels, selectedPurposes, selectedTag, minCredits, maxCredits]);

    const toggleSelection = (value, selectedList, setSelectedList) => {
        if (selectedList.includes(value)) {
            setSelectedList(selectedList.filter(item => item !== value));
        } else {
            setSelectedList([...selectedList, value]);
        }
    };

    const handleSliderChange = (e) => {
        debouncedHandleSliderChange( e )
    };

    return (
        <div className="cs_shop_sidebar">
            {/* Search */}
            <div className="cs_shop_sidebar_widget">
                <input
                    className="cs_shop_search_input cs_shop-input"
                    type="text"
                    placeholder="Search AI Agents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Models */}
            <div className="cs_shop_sidebar_widget">
                <h3 className="cs_shop_sidebar_widget_title">Model</h3>
                <ul className="cs_shop_sidebar_category_list">
                    {modelList.map((model, index) => (
                        <li key={index}>
                            <div className="cs_checkbox_group">
                                <input
                                    type="checkbox"
                                    id={`model-${model}`}
                                    checked={selectedModels.includes(model)}
                                    onChange={() => toggleSelection(model, selectedModels, setSelectedModels)}
                                />
                                <label htmlFor={`model-${model}`}>{model}</label>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Purpose */}
            <div className="cs_shop_sidebar_widget">
                <h3 className="cs_shop_sidebar_widget_title">Purpose</h3>
                <ul className="cs_shop_sidebar_category_list">
                    {purposeList.map((purpose, index) => (
                        <li key={index}>
                            <div className="cs_checkbox_group">
                                <input
                                    type="checkbox"
                                    id={`purpose-${purpose}`}
                                    checked={selectedPurposes.includes(purpose)}
                                    onChange={() => toggleSelection(purpose, selectedPurposes, setSelectedPurposes)}
                                />
                                <label htmlFor={`purpose-${purpose}`}>{purpose}</label>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Tags */}
            <div className="cs_shop_sidebar_widget">
                <h3 className="cs_shop_sidebar_widget_title">Tags</h3>
                <ul className="cs_shop_sidebar_tag_list">
                    {tagList.map((tag, index) => (
                        <li key={index}>
                            <button
                                className={selectedTag === tag ? 'active' : ''}
                                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                            >
                                {tag}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Credits Slider */}
            <div className="cs_shop_sidebar_widget">
                <h3 className="cs_shop_sidebar_widget_title">Credits per Task</h3>
                <MultiRangeSlider
                    min={0}
                    max={500}
                    step={1}
                    minValue={minCredits}
                    maxValue={maxCredits}
                    ruler={false}
                    label={true}
                    onInput={handleSliderChange}
                />
                <div className="cs_multirange_price mt-2">
                    {minCredits} credits - {maxCredits} credits
                </div>
            </div>
        </div>
    );
}
