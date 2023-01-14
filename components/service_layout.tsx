import React from 'react';
import Head from 'next/head';
import { Box, BoxProps } from '@chakra-ui/react';
import GNB from '@/components/GNB';

interface Props {
  title: string;
  children: React.ReactNode;
}

const ServiceLayout: React.FC<Props & BoxProps> = function ({ title = '테스트', children, ...boxProps }) {
  return (
    <Box {...boxProps}>
      <Head>
        <title>{title}</title>
      </Head>
      <GNB />
      {children}
    </Box>
  );
};

export default ServiceLayout;
