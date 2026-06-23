import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as deliveryApi from '../api/deliveryApi';
import { toast } from 'react-toastify';

export const useTodayDeliveries = () =>
  useQuery('todayDeliveries', deliveryApi.getTodayDeliveries, {
    select: (res) => res.data,
    refetchInterval: 30000,
  });

export const useMarkDelivered = () => {
  const queryClient = useQueryClient();
  return useMutation(({ custId, quantity }) => deliveryApi.markDelivered(custId, quantity), {
    onSuccess: () => {
      queryClient.invalidateQueries('todayDeliveries');
      toast.success('Delivery marked as done');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to mark delivery'),
  });
};

export const useMarkSkipped = () => {
  const queryClient = useQueryClient();
  return useMutation(({ custId, reason }) => deliveryApi.markSkipped(custId, reason), {
    onSuccess: () => {
      queryClient.invalidateQueries('todayDeliveries');
      toast.success('Delivery marked as skipped');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to mark skip'),
  });
};

export const useDeliveryHistory = (id) =>
  useQuery(['deliveryHistory', id], () => deliveryApi.getDeliveryHistory(id), {
    select: (res) => res.data,
    enabled: !!id,
  });

export const useMonthlyReport = (month, year) =>
  useQuery(['monthlyReport', month, year], () => deliveryApi.getMonthlyReport(month, year), {
    select: (res) => res.data,
    enabled: !!month && !!year,
  });
