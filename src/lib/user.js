import { API_RPCIDE_URL } from "../config";

export const verifyToken = async (token) => {
  const response = await fetch(`${API_RPCIDE_URL}/auth`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
};
