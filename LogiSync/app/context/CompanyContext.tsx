import React, { createContext, useContext } from "react";

import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";

import { API_URL, useAuth } from "./AuthContext";

export const PermissionsKeys = {
  owner: "owner",
  getEmployees: "getEmployees",
  getAllLoads: "getAllLoads",
  editAllLoads: "editAllLoads",
};

export interface Company {
  _id: string;
  name: string;
}

export interface Load {
  _id?: string;
  title: string;
  employeeId: string;
  data: {
    registration: string;
    content: string;
    weight: number | undefined;
    distance: number | undefined;
    start: string;
    end: string;
    timeCompleted: Date;
  };
}

export interface Employee {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  permissions: any;
}

interface CompanyProps {
  // Company
  company?: Company;
  deleteCompany?: UseMutationResult<any, Error, any, unknown>;
  // Permissions
  permissions?: UseQueryResult<Map<string, boolean> | undefined, Error>;
  // Employees
  employees?: UseQueryResult<Employee[] | undefined, Error>;
  addEmployee?: UseMutationResult<any, Error, any, unknown>;
  removeEmployee?: UseMutationResult<any, Error, any, unknown>;
  updateEmployee?: UseMutationResult<any, Error, any, unknown>;
  // Loads
  loads?: UseQueryResult<Load[] | undefined, Error>;
  createLoad?: UseMutationResult<any, Error, Load, unknown>;
  updateLoad?: UseMutationResult<any, Error, Load, unknown>;
  deleteLoad?: UseMutationResult<any, Error, string, unknown>;
}

export const CompanyContext = createContext<CompanyProps>({});

export const useCompany = () => useContext(CompanyContext);

export default function CompanyProvider({
  children,
  company,
}: {
  children: any;
  company: Company;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  /* COMPANY */
  const deleteCompany = useMutation({
    mutationFn: async () => {
      try {
        const result = await axios.delete(`${API_URL}/company`, {
          data: { companyId: company._id },
        });
        return result.data;
      } catch (error: any) {
        alert(
          error.response.data.msg == undefined ? error.message : error.response.data.msg
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user"],
      });
    },
  });

  /* PERMISSIONS */
  const permissions = useQuery({
    queryKey: ["permissions", company._id, user!.data!.user._id],
    queryFn: async () => {
      try {
        const result = await axios.get<{
          permissions: Map<string, boolean>;
        }>(`${API_URL}/company/employees/${company._id}/${user!.data!.user._id}`);

        return new Map(Object.entries(result.data.permissions));
      } catch (error: any) {
        alert(
          error.response.data.msg == undefined ? error.message : error.response.data.msg
        );
      }
    },
  });

  /* EMPLOYEES */
  const employees = useQuery({
    queryKey: ["employees", company._id],
    queryFn: async () => {
      try {
        const result = await axios.get<Employee[]>(
          `${API_URL}/company/employees/${company._id}`
        );

        return result.data.map((employee) => ({
          ...employee,
          permissions: new Map(Object.entries(employee.permissions)),
        }));
      } catch (error: any) {
        alert(
          error.response.data.msg == undefined ? error.message : error.response.data.msg
        );
      }
    },
    enabled:
      permissions.data !== undefined &&
      permissions!.data!.get(PermissionsKeys.getEmployees)!,
  });

  const addEmployee = useMutation({
    mutationFn: async ({
      companyId,
      email,
      permissions,
    }: {
      companyId: string;
      email: string;
      permissions: Map<string, boolean>;
    }) => {
      try {
        const result = await axios.post(`${API_URL}/company/employees`, {
          companyId: companyId,
          email: email,
          permissions: permissions,
        });
        return result.data;
      } catch (error: any) {
        alert(
          error.response.data.msg == undefined ? error.message : error.response.data.msg
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employees", company._id],
      });
    },
  });

  const removeEmployee = useMutation({
    mutationFn: async ({ companyId, id }: { companyId: string; id: string }) => {
      try {
        const result = await axios.delete(`${API_URL}/company/employees`, {
          data: {
            companyId: companyId,
            id: id,
          },
        });

        return result.data;
      } catch (error: any) {
        alert(
          error.response.data.msg == undefined ? error.message : error.response.data.msg
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employees", company._id],
      });
    },
  });

  const updateEmployee = useMutation({
    mutationFn: async ({
      companyId,
      id,
      permissions,
    }: {
      companyId: string;
      id: string;
      permissions: Map<string, boolean>;
    }) => {
      try {
        const result = await axios.patch(`${API_URL}/company/employees`, {
          companyId: companyId,
          id: id,
          permissions: permissions,
        });
        return result.data;
      } catch (error: any) {
        alert(
          error.response.data.msg == undefined ? error.message : error.response.data.msg
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employees", company._id],
      });
    },
  });

  /* LOADS */
  const loads = useQuery({
    queryKey: ["loads", company._id],
    queryFn: async () => {
      try {
        const result = await axios.get<any>(
          `${API_URL}/company/log/${company._id}`
        );

        // fix until i can figure out how to do this in the backend
        let loads = result.data.loads;
        loads.map((load: any) => {
          load.data.weight = load.data.weight.$numberDecimal;
          load.data.distance = load.data.distance.$numberDecimal;
        })

        return loads;
      } catch (error: any) {
        alert(
          error.response.data.msg == undefined ? error.message : error.response.data.msg
        );
      }
    },
    enabled: permissions.data !== undefined,
  });

  const createLoad = useMutation({
    mutationFn: async (load: Load) => {
      try {
        const result = await axios.post(`${API_URL}/company/log`, {
          companyId: company._id,
          title: load.title,
          employeeId: load.employeeId,
          data: load.data,
        });
        return result.data;
      } catch (error: any) {
        alert(
          error.response.data.msg == undefined ? error.message : error.response.data.msg
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loads", company._id] });
    },
  });

  const updateLoad = useMutation({
    mutationFn: async (updatedLoad: Load) => {
      try {
        const result = await axios.patch(`${API_URL}/company/log`, {
          companyId: company._id,
          loadId: updatedLoad._id,
          updatedLoad: updatedLoad,
        });
        return result.data;
      } catch (error: any) {
        alert(
          error.response.data.msg == undefined ? error.message : error.response.data.msg
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loads", company._id] });
    },
  });

  const deleteLoad = useMutation({
    mutationFn: async (loadId: string) => {
      try {
        const result = await axios.delete(`${API_URL}/company/log`, {
          data: { companyId: company._id, loadId: loadId },
        });
        return result.data;
      } catch (error: any) {
        alert(
          error.response.data.msg == undefined ? error.message : error.response.data.msg
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loads", company._id] });
    },
  });

  const value = {
    // Company
    company: company,
    deleteCompany: deleteCompany,
    // Permissions
    permissions: permissions,
    // Employees
    employees: employees,
    addEmployee: addEmployee,
    removeEmployee: removeEmployee,
    updateEmployee: updateEmployee,
    // Loads
    loads: loads,
    createLoad: createLoad,
    updateLoad: updateLoad,
    deleteLoad: deleteLoad,
  };

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}
