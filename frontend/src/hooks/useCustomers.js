import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as customerApi from '../api/customerApi';
import { toast } from 'react-toastify';

export const useCustomers = () =>
  useQuery('customers', customerApi.getAllCustomers, {
    select: (res) => res.data,
  });

export const useActiveCustomers = () =>
  useQuery('activeCustomers', customerApi.getActiveCustomers, {
    select: (res) => res.data,
  });

export const useCustomer = (id) =>
  useQuery(['customer', id], () => customerApi.getCustomerById(id), {
    select: (res) => res.data,
    enabled: !!id,
  });

export const useAddCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation(customerApi.addCustomer, {
    onSuccess: () => {
      queryClient.invalidateQueries('customers');
      toast.success('Customer added successfully');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add customer'),
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation(({ id, data }) => customerApi.updateCustomer(id, data), {
    onSuccess: () => {
      queryClient.invalidateQueries('customers');
      toast.success('Customer updated successfully');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update customer'),
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation(customerApi.deleteCustomer, {
    onSuccess: () => {
      queryClient.invalidateQueries('customers');
      toast.success('Customer deleted successfully');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete customer'),
  });
};
