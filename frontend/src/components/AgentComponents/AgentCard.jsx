import React from 'react';
import { NavLink } from 'react-router-dom';

export default function AgentCard({ title, description, tags, imageUrl, slug, credits }) {
  return (
      <div className="card h-100 bg-dark text-light border border-secondary">
        <img
            src={imageUrl || '/images/agents/agent.png'}
            className="card-img-top"
            alt={title}
            style={{ objectFit: 'cover', height: '200px' }}
            onError={(e) => (e.target.src = '/images/agents/agent.png')}
        />

        <div className="card-body d-flex flex-column">
          <h5 className="card-title mb-2">
            <NavLink to={`/agents/${slug}`} className="text-decoration-none text-white">
              {title}
            </NavLink>
          </h5>

          <p className="card-text text-light small">
            {description?.length > 100 ? description.substring(0, 100) + '...' : description}
          </p>

          {tags?.length > 0 && (
              <div className="mb-3">
                {tags.map((tag, idx) => (
                    <span key={idx} className="badge rounded-pill bg-secondary text-light me-1">
                {tag.value}
              </span>
                ))}
              </div>
          )}

          <div className="mt-auto d-flex justify-content-between align-items-center">
            <span className="fw-semibold text-light">{credits} credits per task</span>
            <NavLink to={`/agents/${slug}`} className="cs_product_btn cs_semi_bold">
              View Agent
            </NavLink>
          </div>
        </div>
      </div>
  );
}
