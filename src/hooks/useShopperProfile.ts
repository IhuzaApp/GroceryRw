import useSWR from "swr";
import { useSession } from "next-auth/react";
import { authenticatedFetch } from "../lib/authenticatedFetch";

const fetcher = (url: string) => authenticatedFetch(url).then((res) => res.json());

export interface ShopperProfile {
  id: string;
  full_name: string;
  profile_photo?: string;
  transport_mode?: string;
  status?: string;
  User?: {
    email: string;
    profile_picture?: string;
    name?: string;
  };
}

export const useShopperProfile = () => {
  const { data: session } = useSession();
  
  const { data, error, isLoading, mutate } = useSWR(
    session?.user?.id ? "/api/queries/shopper-profile" : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute cache
    }
  );

  const shopper: ShopperProfile | null = data?.shopper || null;

  // Logic to determine the best profile image
  const profileImage =
    shopper?.profile_photo || // 1. Priority: Database shopper photo
    shopper?.User?.profile_picture || // 2. User table profile picture
    session?.user?.image || // 3. Session image
    null;

  // Logic for display name
  const displayName = 
    shopper?.full_name || 
    shopper?.User?.name || 
    session?.user?.name || 
    "Shopper";

  return {
    shopper,
    profileImage,
    displayName,
    isLoading,
    isError: error,
    mutate,
  };
};
