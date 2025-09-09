import { useNotification } from '@strapi/strapi/admin';

export function useAlert() {
  const { toggleNotification } = useNotification();

  function handleNotification({
    type = 'info',
    message = 'Something occurred in Upstash Search',
    link,
    blockTransition = true,
    title,
  }: {
    type: 'info' | 'warning' | 'success';
    message: string;
    link?: string;
    blockTransition?: boolean;
    title?: string;
  }) {
    toggleNotification({
      title,
      type,
      message,
      link: link ? { url: link, label: link } : undefined,
      blockTransition,
      onClose: () => localStorage.setItem('STRAPI_UPDATE_NOTIF', 'true'),
    });
  }

  const checkForbiddenError = ({ response }: { response: any }) => {
    const status = response?.data?.error?.status;
    if (status && status === 403) {
      handleNotification({
        title: 'Forbidden',
        type: 'warning',
        message: 'You do not have permission to do this action',
        blockTransition: false,
      });
    }
  };

  return {
    handleNotification,
    checkForbiddenError,
  };
}

export default useAlert;
