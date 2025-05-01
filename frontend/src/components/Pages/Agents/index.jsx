import React, { useEffect, useState } from 'react';
import Spacing from '../../Spacing';
import SectionHeadingStyle3 from '../../SectionHeading/SectionHeadingStyle3';
import Sort from '../../AgentComponents/Sort';
import Filter from '../../AgentComponents/Filter';
import AgentList from '../../AgentComponents/AgentList';
import axios from 'axios';
import Pagination from '../../Pagination';

const API = `${process.env.REACT_APP_BACKEND_URL}/api/agents`;

export default function Marketplace() {
    const [originalData, setOriginalData] = useState([]); // Original fetched data
    const [filteredData, setFilteredData] = useState([]); // Displayed data
    const [filters, setFilters] = useState({});

    useEffect(() => {
        axios.get(API)
            .then((response) => {
                setOriginalData(response.data);
                setFilteredData(response.data);
            })
            .catch((error) => {
                console.error('Error fetching agents:', error);
            });
    }, []);

    const handleFilterChange = (filterValues) => {
        setFilters(filterValues);
        applyFilters(filterValues);
    };

    const applyFilters = (filterValues) => {
        let result = [...originalData];

        // Search term
        if (filterValues.searchTerm) {
            result = result.filter(agent =>
                agent.name.toLowerCase().includes(filterValues.searchTerm.toLowerCase())
            );
        }

        // Models
        if (filterValues.selectedModels?.length > 0) {
            result = result.filter(agent =>
                filterValues.selectedModels.includes(agent.model)
            );
        }

        // Purpose
        if (filterValues.selectedPurposes?.length > 0) {
            result = result.filter(agent =>
                filterValues.selectedPurposes.includes(agent.purpose)
            );
        }

        // Tags
        if (filterValues.selectedTag) {
            result = result.filter(agent =>
                agent.tags?.some(tag => tag.value === filterValues.selectedTag)
            );
        }

        // Credits per task range
        result = result.filter(agent =>
            agent.creditsPerTask >= filterValues.minCredits &&
            agent.creditsPerTask <= filterValues.maxCredits
        );

        setFilteredData(result);
    };

    const totalItems = filteredData.length;

    return (
        <>
            <Spacing lg="70" md="70" />
            <Spacing lg="140" md="80" />
            <SectionHeadingStyle3
                title="AI Agents"
                subTitle="Marketplace"
                variant="text-center"
            />
            <Spacing lg="75" md="60" />
            <div className="container">
                <div className="row">
                    <div className="col-lg-3">
                        <Filter onFilterChange={handleFilterChange} />
                    </div>
                    <div className="col-lg-9">
                        <div className="cs_height_0 cs_height_lg_60" />
                        <Sort />
                        {totalItems === 0 ? (
                            <p className="text-warning">No agents match your criteria.</p>
                        ) : (
                            <>
                                <AgentList data={filteredData} />
                                <Pagination />
                            </>
                        )}
                    </div>
                </div>
            </div>
            <Spacing lg="150" md="80" />
        </>
    );
}
