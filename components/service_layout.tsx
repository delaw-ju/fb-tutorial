import React from 'react';
import Head from 'next/head';

interface Props {
  title: string;
  children: React.ReactNode;
}

const ServiceLayout = function ({ title = '테스트', children }: Props) {
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      {children}
    </div>
  );
};

export default ServiceLayout;
