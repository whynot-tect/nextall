// File: C:\Users\hanos\nextall\frontend\src\components\_admin\compaigns\editCompaign.jsx
import React from 'react';
// components
import CompaignForm from 'src/components/forms/compaign';

export default function editCompaign({ data, isLoading }) {
  return (
    <div>
      <CompaignForm data={data} isLoading={isLoading} />
    </div>
  );
}
