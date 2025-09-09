import React, { memo } from 'react';
import { Th, Thead, Tr, Typography, VisuallyHidden } from '@strapi/design-system';
import { useRBAC } from '@strapi/strapi/admin';
import { PERMISSIONS } from '../../constants';

const CollectionTableHeader = () => {
  const {
    allowedActions: { canCreate, canUpdate, canDelete },
  } = useRBAC(PERMISSIONS.collections);

  return (
    <Thead>
      <Tr>
        {(canCreate || canDelete) && (
          <Th>
            <VisuallyHidden>INDEX</VisuallyHidden>
          </Th>
        )}
        <Th>
          <Typography variant="sigma">NAME</Typography>
        </Th>
        <Th>
          <Typography variant="sigma">IN UPSTASH SEARCH</Typography>
        </Th>
        <Th>
          <Typography variant="sigma">INDEXING</Typography>
        </Th>
        <Th>
          <Typography variant="sigma">INDEX NAME</Typography>
        </Th>
        <Th>
          <Typography variant="sigma">DOCUMENTS</Typography>
        </Th>
        <Th>
          <Typography variant="sigma">HOOKS</Typography>
        </Th>
        {canUpdate && (
          <Th>
            <VisuallyHidden>Actions</VisuallyHidden>
          </Th>
        )}
      </Tr>
    </Thead>
  );
};

export default memo(CollectionTableHeader);
