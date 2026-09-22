import React from 'react';
import type { CustomSection } from '@/types/resume';
import './custom-sections.less';

type Props = {
  sections?: CustomSection[];
  color: string;
  renderTitle?: (title: string, body: React.ReactNode) => React.ReactNode;
};

export const CustomSections: React.FC<Props> = ({
  sections = [],
  color,
  renderTitle,
}) => (
  <>
    {sections.map(section => {
      const body = (
        <div className="section section-custom">
          {section.items.map((item, index) => (
            <div className="section-item" key={`${section.id}-${index}`}>
              {(item.title || item.subtitle) && (
                <div className="section-info">
                  <b className="info-name">{item.title}</b>
                  {item.subtitle && (
                    <span className="sub-info">{item.subtitle}</span>
                  )}
                </div>
              )}
              {item.description && (
                <div style={{ whiteSpace: 'pre-wrap' }}>{item.description}</div>
              )}
            </div>
          ))}
        </div>
      );

      if (renderTitle) {
        return (
          <React.Fragment key={section.id}>
            {renderTitle(section.title, body)}
          </React.Fragment>
        );
      }

      return (
        <section className="section section-custom" key={section.id}>
          <div className="section-title" style={{ color }}>
            {section.title}
          </div>
          {body}
        </section>
      );
    })}
  </>
);
