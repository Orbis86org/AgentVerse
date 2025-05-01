import React from 'react';
import AgentCard from './AgentCard'; // was Product

export default function AgentList({ data }) {
  return (
      <div className="row cs_gap_y_45">
        {data.map((item, index) => (
            <div className="col-lg-4 col-sm-6" key={index}>
              <AgentCard
                  title={item.name}
                  description={item.description}
                  tags={item.tags}
                  imageUrl={item.imageUrl}
                  slug={item.slug}
                  credits={item.creditsPerTask}
              />
            </div>
        ))}
      </div>
  );
}
