import { useAuth0, User } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useMutation, useQuery } from "react-query";
import { toast } from "sonner";
// import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useGetMyuser = () => {
  const { getAccessTokenSilently } = useAuth0();
  // console.log(getAccessTokenSilently);
  const getMyUserRequest = async (): Promise<User> => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/my/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    // console.log(response);
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error data:", errorData);
      throw new Error("Failed to fetch user");
    }

    return await response.json();
  };

  const {
    data: currentUser,
    isLoading,
    error,
  } = useQuery("fetchCurrenrtUser", getMyUserRequest);

  if (error) {
    toast.error(error.toString());
  }

  return { currentUser, isLoading };
};

type CreateUserRequest = {
  auth0Id: string;
  email: string;
};

// Creating custom hook here for connecting with the API
export const useCreateMyUser = () => {
  const { getAccessTokenSilently } = useAuth0();

  const createMyUserRequest = async (user: CreateUserRequest) => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/my/user`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    console.log(response);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create user");
    }

    // return response.json();
  };

  const {
    mutateAsync: createUser,
    isLoading,
    isError,
    isSuccess,
  } = useMutation(createMyUserRequest);

  return { createUser, isLoading, isError, isSuccess };
};

type updateMyUserRequest = {
  name: string;
  addressLine1: string;
  country: string;
  city: string;
};

export const useUpdateMyUser = () => {
  const { getAccessTokenSilently } = useAuth0();

  const updateMyUserRequest = async (formData: updateMyUserRequest) => {
    const accessToken = await getAccessTokenSilently();

    try {
      const response = await fetch(`${API_BASE_URL}/api/my/user`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error data:", errorData);
        throw new Error("Failed to update user");
      }
      console.log(response);

      return await response.json();
    } catch (error) {
      console.error("Update user error:", error);
      throw error; // Rethrow the error to handle it outside
    }
  };

  const {
    mutateAsync: updateUser,
    isLoading,
    isSuccess,
    error,
    reset,
  } = useMutation(updateMyUserRequest);

  useEffect(() => {
    if (isSuccess) {
      toast.success("User updated successfully!");
      reset(); // Reset form or any state after success
    }
  }, [isSuccess, reset]);

  useEffect(() => {
    if (error) {
      toast.error(error.toString());
    }
  }, [error]);
  return { updateUser, isLoading };
};
