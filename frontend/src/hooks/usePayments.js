import { useQuery } from 'react-query';
import * as paymentApi from '../api/paymentApi';

export const usePaymentHistory = (customerId) =>
  useQuery(['paymentHistory', customerId], () => paymentApi.getPaymentHistory(customerId), {
    select: (res) => res.data,
    enabled: !!customerId,
  });

export const useOutstandingDues = () =>
  useQuery('outstandingDues', paymentApi.getOutstandingDues, {
    select: (res) => res.data,
  });
