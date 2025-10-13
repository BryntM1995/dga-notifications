import React from 'react';

const PageHeader: React.FC<{ title: string; id: string }> = ({ title, id }) => (
  <>
    <h4 className="mb-1">{title}</h4>
    <div className="page-id mb-3">
      Sistema: DGA-NOTIF · Pantalla: {title} · ID: {id}
    </div>
  </>
);

export default PageHeader;
