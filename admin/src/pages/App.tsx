import { Route, Routes } from 'react-router-dom';
import { Page } from '@strapi/strapi/admin';

import { PERMISSIONS } from '../constants';
import { HomePage } from './HomePage';

const App = () => {
  return (
    <Page.Protect permissions={PERMISSIONS.main}>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="*" element={<Page.Error />} />
      </Routes>
    </Page.Protect>
  );
};

export { App };
