import React, { memo, useMemo, useState } from 'react';
import {
  Checkbox,
  Box,
  Button,
  Flex,
  Typography,
  Modal,
  Grid,
  TextInput,
  Switch,
} from '@strapi/design-system';
import { CheckCircle, Cog } from '@strapi/icons';
import { useRBAC } from '@strapi/strapi/admin';
import { PERMISSIONS } from '../../constants';
import type { Collection } from '../../hooks/useCollection';

type CollectionColumnProps = {
  entry: Collection;
  deleteCollection: ({ contentType }: { contentType: string }) => void;
  addCollection: ({
    contentType,
    searchableFields,
    indexUids,
  }: {
    contentType: string;
    searchableFields?: string[];
    indexUids?: string[];
  }) => void;
  updateCollection: ({ contentType }: { contentType: string }) => void;
};

const CollectionColumn = ({ entry, deleteCollection, addCollection }: CollectionColumnProps) => {
  const {
    allowedActions: { canCreate, canDelete },
  } = useRBAC(PERMISSIONS.collections);

  // Modal state
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [customIndexName, setCustomIndexName] = useState(entry.indexUid);
  const allFields = useMemo(() => entry.fields || [], [entry.fields]);

  const toggleField = (name: string) => {
    setSelected((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  };

  const onConfirmAdd = async () => {
    if (selected.length === 0) return;

    // Use custom index name if provided, otherwise let system use default
    const indexUids = customIndexName.trim() ? [customIndexName.trim()] : undefined;

    await addCollection({
      contentType: entry.contentType,
      searchableFields: selected,
      indexUids,
    });
    setOpen(false);
    setSelected([]);
    setCustomIndexName('');
  };

  const handleModalClose = () => {
    setOpen(false);
    setSelected([]);
    setCustomIndexName('');
  };

  const handleSwitchChange = (checked: boolean) => {
    if (checked) {
      // If turning on, open configuration modal
      setOpen(true);
    } else {
      // If turning off, remove from index
      deleteCollection({ contentType: entry.contentType });
    }
  };

  // Disable switch if there are no entries to index
  const hasEntries = entry.numberOfEntries > 0;
  const switchDisabled = !hasEntries;

  return (
    <Box>
      {/* Toggle Section with proper accessibility */}
      {(canCreate || canDelete) && (
        <Box marginBottom={6} role="group" aria-labelledby="indexing-control">
          <Box textAlign="center" marginBottom={3}>
            <Typography
              variant="pi"
              fontWeight="semiBold"
              textColor="neutral800"
              id="indexing-control"
              tag="label"
            >
              {entry.indexed ? 'Disable Indexing' : 'Enable Indexing'}
            </Typography>
          </Box>

          <Box
            marginBottom={3}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Switch
              checked={entry.indexed}
              onCheckedChange={handleSwitchChange}
              aria-labelledby="indexing-control"
              aria-describedby="indexing-help"
              disabled={switchDisabled}
              style={{
                cursor: switchDisabled ? 'not-allowed' : 'pointer',
              }}
            />
          </Box>

          <Box textAlign="center">
            <Typography
              variant="pi"
              textColor={switchDisabled ? 'neutral500' : 'neutral600'}
              style={{ fontSize: '12px' }}
              id="indexing-help"
              lineHeight={1.4}
            >
              {switchDisabled
                ? 'No entries to index'
                : entry.indexed
                  ? 'Collection is being indexed'
                  : 'Toggle to start indexing'}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Enhanced Configuration Modal */}
      <Modal.Root open={open} onOpenChange={handleModalClose}>
        <Modal.Content
          aria-labelledby={`${entry.contentType}-config-modal`}
          style={{ maxWidth: '560px' }}
        >
          <Modal.Header>
            <Modal.Title id={`${entry.contentType}-config-modal`}>
              <Typography variant="beta" fontWeight="semiBold" textColor="neutral800">
                Configure {entry.collection}
              </Typography>
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Box padding={2}>
              {/* Index Configuration Section */}
              <Box marginBottom={6} gap={2}>
                <Flex alignItems="center" marginBottom={3}>
                  <Typography variant="delta" textColor="neutral800" fontWeight="semiBold">
                    Index Name
                  </Typography>
                </Flex>
                <TextInput
                  id="custom-index-name"
                  value={customIndexName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCustomIndexName(e.target.value)
                  }
                  placeholder={`${entry.collection}`}
                  size="M"
                />

                {/* Index name required error - right below input */}
                {customIndexName.trim() === '' && (
                  <Box marginTop={2}>
                    <Typography textColor="danger600" variant="pi" fontWeight="medium">
                      Index name is required
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Searchable Fields Section */}
              <Box>
                <Flex alignItems="center" gap={2} marginBottom={4}>
                  <Typography variant="delta" textColor="neutral800" fontWeight="semiBold">
                    Searchable Fields
                  </Typography>
                </Flex>

                <Box>
                  {allFields.map((name) => (
                    <Box key={name} marginBottom={3}>
                      <Flex alignItems="center" gap={3}>
                        <Checkbox
                          checked={selected.includes(name)}
                          onCheckedChange={() => toggleField(name)}
                          size="S"
                        />
                        <Typography
                          variant="pi"
                          textColor={selected.includes(name) ? 'primary600' : 'neutral700'}
                          fontWeight="medium"
                          style={{ cursor: 'pointer' }}
                          onClick={() => toggleField(name)}
                        >
                          {name}
                        </Typography>
                      </Flex>
                    </Box>
                  ))}

                  {allFields.length === 0 && (
                    <Box padding={4} background="neutral100" borderRadius="4px" textAlign="center">
                      <Typography textColor="neutral500" variant="pi">
                        No fields found
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Simple error message */}
                {selected.length === 0 && allFields.length > 0 && (
                  <Box marginTop={3}>
                    <Typography textColor="danger600" variant="pi" fontWeight="medium">
                      Please select at least one field
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Modal.Body>

          <Modal.Footer>
            <Flex justifyContent="space-between" alignItems="center" width="100%">
              <Modal.Close>
                <Button variant="tertiary">Cancel</Button>
              </Modal.Close>
              <Button
                onClick={onConfirmAdd}
                disabled={selected.length === 0 || customIndexName.trim() === ''}
                startIcon={<CheckCircle aria-hidden="true" />}
              >
                {entry.indexed ? 'Update' : 'Enable'}
              </Button>
            </Flex>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </Box>
  );
};

export default memo(CollectionColumn);
