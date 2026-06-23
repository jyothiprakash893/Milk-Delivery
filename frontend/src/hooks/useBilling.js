import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as billingApi from '../api/billingApi';
import { toast } from 'react-toastify';

export const useAllBills = (month, year) =>
  useQuery(['bills', month, year], () => billingApi.getAllBills(month, year), {
    select: (res) => res.data,
    enabled: !!month && !!year,
  });

export const useCustomerBills = (id) =>
  useQuery(['customerBills', id], () => billingApi.getCustomerBills(id), {
    select: (res) => res.data,
    enabled: !!id,
  });

export const useUnpaidBills = () =>
  useQuery('unpaidBills', billingApi.getUnpaidBills, {
    select: (res) => res.data,
  });

export const useGenerateBills = () => {
  const queryClient = useQueryClient();
  return useMutation(({ month, year }) => billingApi.generateBills(month, year), {
    onSuccess: () => {
      queryClient.invalidateQueries('bills');
      toast.success('Bills generated successfully');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to generate bills'),
  });
};
