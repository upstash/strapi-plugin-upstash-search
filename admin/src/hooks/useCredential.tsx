import { useState, useEffect } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';
import { PLUGIN_ID } from '../pluginId';
import useAlert from './useAlert';

export function useCredential() {
  const [credentials, setCredentials] = useState({
    host: '',
    apiKey: '',
  });
  const [refetchIndex, setRefetchIndex] = useState(true);
  const [host, setHost] = useState('');
  const [apiKey, setApiKey] = useState('');
  const { handleNotification } = useAlert();
  const { get, post } = useFetchClient();

  const refetchCredentials = () => setRefetchIndex((prevRefetchIndex) => !prevRefetchIndex);

  const updateCredentials = async () => {
    const {
      data: { error },
    } = await post(`/${PLUGIN_ID}/credential`, {
      apiKey: apiKey,
      host: host,
    });
    if (error) {
      handleNotification({
        type: 'warning',
        message: error.message,
        link: error.link,
      });
    } else {
      refetchCredentials();
      handleNotification({
        type: 'success',
        message: 'Credentials sucessfully updated!',
        blockTransition: false,
      });
    }
  };

  const fetchCredentials = async () => {
    const {
      data: { data, error },
    } = await get(`/${PLUGIN_ID}/credential`);

    if (error) {
      handleNotification({
        type: 'warning',
        message: error.message,
        link: error.link,
      });
    } else {
      setCredentials(data);
      setHost(data.host);
      setApiKey(data.apiKey);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, [refetchIndex]);

  return {
    credentials,
    updateCredentials,
    setHost,
    setApiKey,
    host,
    apiKey,
  };
}
export default useCredential;
