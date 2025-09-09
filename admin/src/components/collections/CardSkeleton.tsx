import { Box, Flex } from '@strapi/design-system';

export const SkeletonCard = () => (
  <Box
    background="neutral0"
    padding={6}
    borderRadius="4px"
    borderWidth="1px"
    borderStyle="solid"
    borderColor="neutral200"
    style={{
      width: '270px',
      minHeight: '400px',
      boxShadow: '0px 1px 4px rgba(33, 33, 52, 0.1)',
    }}
  >
    <Box textAlign="center" marginBottom={4}>
      <Box
        style={{
          width: '64px',
          height: '64px',
          backgroundColor: '#f6f6f9',
          borderRadius: '4px',
          margin: '0 auto',
        }}
      />
    </Box>

    <Box textAlign="center" marginBottom={3}>
      <Box
        style={{
          width: '140px',
          height: '24px',
          backgroundColor: '#f6f6f9',
          borderRadius: '4px',
          margin: '0 auto 8px',
        }}
      />
      <Box
        style={{
          width: '100px',
          height: '16px',
          backgroundColor: '#f6f6f9',
          borderRadius: '4px',
          margin: '0 auto',
        }}
      />
    </Box>

    <Box textAlign="center" marginBottom={3}>
      <Flex justifyContent="center" gap={2}>
        <Box
          style={{
            width: '50px',
            height: '20px',
            backgroundColor: '#f6f6f9',
            borderRadius: '4px',
          }}
        />
      </Flex>
    </Box>

    <Box marginBottom={4}>
      <Box
        style={{
          width: '120px',
          height: '16px',
          backgroundColor: '#f6f6f9',
          borderRadius: '4px',
          margin: '0 auto 8px',
        }}
      />
      <Box
        style={{
          width: '32px',
          height: '32px',
          backgroundColor: '#f6f6f9',
          borderRadius: '4px',
          margin: '0 auto',
        }}
      />
    </Box>

    <Box height="1px" background="neutral150" marginBottom={4} role="separator" />

    <Box>
      <Box textAlign="center" marginBottom={3}>
        <Box
          style={{
            width: '90px',
            height: '16px',
            backgroundColor: '#f6f6f9',
            borderRadius: '4px',
            margin: '0 auto',
          }}
        />
      </Box>

      <Box
        marginBottom={3}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box
          style={{
            width: '44px',
            height: '24px',
            backgroundColor: '#f6f6f9',
            borderRadius: '12px',
          }}
        />
      </Box>

      <Box textAlign="center">
        <Box
          style={{
            width: '100px',
            height: '12px',
            backgroundColor: '#f6f6f9',
            borderRadius: '4px',
            margin: '0 auto',
          }}
        />
      </Box>
    </Box>
  </Box>
);
